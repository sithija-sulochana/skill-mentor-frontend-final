import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/components/hooks/use-toast";
import { getAllPayments, updatePayment, deletePayment } from "@/lib/api";
import type { Payment } from "@/lib/api";

export default function PaymentManage() {
  const { getToken } = useAuth();
  const { toast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPayments = async () => {
    try {
      const token = await getToken({ template: "skill-mentor" });
      if (!token) throw new Error("Not authenticated");
      
      const data = await getAllPayments(token);
      setPayments(data);
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast({
        title: "Error",
        description: "Failed to load payments. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (paymentId: number, newStatus: "PENDING" | "APPROVED" | "REJECTED") => {
    setIsUpdating(true);
    try {
      const token = await getToken({ template: "skill-mentor" });
      if (!token) throw new Error("Not authenticated");

      await updatePayment(token, paymentId, { paymentStatus: newStatus });
      
      // Update local state
      setPayments(payments.map(p => 
        p.id === paymentId ? { ...p, paymentStatus: newStatus } : p
      ));

      toast({
        title: "Status Updated",
        description: `Payment status changed to ${newStatus}.`,
      });
    } catch (error) {
      console.error("Error updating payment:", error);
      toast({
        title: "Error",
        description: "Failed to update payment status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (paymentId: number) => {
    if (!confirm("Are you sure you want to delete this payment?")) return;

    try {
      const token = await getToken({ template: "skill-mentor" });
      if (!token) throw new Error("Not authenticated");

      await deletePayment(token, paymentId);
      
      // Update local state
      setPayments(payments.filter(p => p.id !== paymentId));

      toast({
        title: "Payment Deleted",
        description: "Payment record has been removed.",
      });
    } catch (error) {
      console.error("Error deleting payment:", error);
      toast({
        title: "Error",
        description: "Failed to delete payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const viewReceipt = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsDialogOpen(true);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="container py-10">
        <Card>
          <CardContent className="py-8 text-center">
            Loading payments...
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Payment Management</span>
            <Button variant="outline" onClick={fetchPayments}>
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No payments found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Session ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{payment.id}</TableCell>
                    <TableCell className="max-w-37.5 truncate">
                      {payment.studentId}
                    </TableCell>
                    <TableCell>{payment.sessionId}</TableCell>
                    <TableCell>
                      <Select
                        value={payment.paymentStatus}
                        onValueChange={(value) => 
                          handleStatusChange(payment.id, value as "PENDING" | "APPROVED" | "REJECTED")
                        }
                        disabled={isUpdating}
                      >
                        <SelectTrigger className={`w-32.5 ${getStatusBadgeClass(payment.paymentStatus)}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PENDING">PENDING</SelectItem>
                          <SelectItem value="APPROVED">APPROVED</SelectItem>
                          <SelectItem value="REJECTED">REJECTED</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="max-w-50 truncate">
                      {payment.note || "-"}
                    </TableCell>
                    <TableCell>{formatDate(payment.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => viewReceipt(payment)}
                        >
                          View Receipt
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDelete(payment.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Receipt Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payment Receipt</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Payment ID:</strong> {selectedPayment.id}
                </div>
                <div>
                  <strong>Session ID:</strong> {selectedPayment.sessionId}
                </div>
                <div>
                  <strong>Student ID:</strong> {selectedPayment.studentId}
                </div>
                <div>
                  <strong>Status:</strong>{" "}
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(selectedPayment.paymentStatus)}`}>
                    {selectedPayment.paymentStatus}
                  </span>
                </div>
                {selectedPayment.note && (
                  <div className="col-span-2">
                    <strong>Note:</strong> {selectedPayment.note}
                  </div>
                )}
              </div>
              {selectedPayment.receipt_url ? (
                <div className="border rounded p-2 bg-gray-50">
                  <img
                    src={selectedPayment.receipt_url}
                    alt="Payment Receipt"
                    className="max-w-full h-auto rounded"
                  />
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No receipt image available.
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
