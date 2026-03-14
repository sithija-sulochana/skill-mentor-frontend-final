"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
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
import { useToast } from "@/components/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Search,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Video,
  CreditCard,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  Link2,
  CalendarRange,
  BookOpen,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Session type matching backend SessionResponseDTO (flat structure)
interface Session {
  id: number;
  // Flat student fields
  studentId?: number;
  studentName?: string;
  studentEmail?: string;
  // Flat mentor fields
  mentorId?: number;
  mentorName?: string;
  mentorEmail?: string;
  mentorProfileImageUrl?: string;
  // Flat subject fields
  subjectId?: number;
  subjectName?: string;
  // Session fields
  sessionAt: string;
  durationMinutes: number;
  sessionStatus: "SCHEDULED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  paymentStatus: "PENDING" | "CONFIRMED" | "COMPLETED" | "REFUNDED";
  meetingLink?: string;
  notes?: string;
  createdAt?: string;
  // Nested objects (used when fetching single session)
  student?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  mentor?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    profileImageUrl?: string;
  };
  subject?: {
    id: number;
    subjectName: string;
    description?: string;
  };
}

type SortField =
  | "id"
  | "sessionAt"
  | "studentName"
  | "mentorName"
  | "subjectName"
  | "durationMinutes"
  | "paymentStatus"
  | "sessionStatus";
type SortDirection = "asc" | "desc";

export default function ManageBookings() {
  const { getToken } = useAuth();
  const { toast } = useToast();

  // Data state
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);

  // Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [sessionStatusFilter, setSessionStatusFilter] = useState<string>("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Sort state
  const [sortField, setSortField] = useState<SortField>("sessionAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Dialog state
  const [meetingLinkDialog, setMeetingLinkDialog] = useState<{
    open: boolean;
    sessionId: number | null;
    currentLink: string;
  }>({ open: false, sessionId: null, currentLink: "" });
  const [newMeetingLink, setNewMeetingLink] = useState("");

  // Status change dialog state
  const [statusDialog, setStatusDialog] = useState<{
    open: boolean;
    sessionId: number | null;
    currentStatus: Session["sessionStatus"] | null;
    currentPaymentStatus: Session["paymentStatus"] | null;
  }>({ open: false, sessionId: null, currentStatus: null, currentPaymentStatus: null });
  const [newSessionStatus, setNewSessionStatus] = useState<Session["sessionStatus"]>("SCHEDULED");
  const [newPaymentStatus, setNewPaymentStatus] = useState<Session["paymentStatus"]>("PENDING");

  // Fetch all sessions
  const fetchSessions = async () => {
    try {
      setLoading(true);
      const token = await getToken({ template: "skill-mentor" });
      const res = await fetch(`${API_BASE_URL}/api/v1/sessions`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error("Failed to fetch sessions");

      const data = await res.json();
      setSessions(data);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      toast({
        title: "Error",
        description: "Failed to load sessions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update session
  const updateSession = async (
    sessionId: number,
    updates: Partial<Session>
  ) => {
    try {
      setUpdating(sessionId);
      const token = await getToken({ template: "skill-mentor" });

      // Fetch the full session to get mentor and subject IDs
      // (the list endpoint returns flat DTO without IDs)
      const fullSessionRes = await fetch(
        `${API_BASE_URL}/api/v1/sessions/${sessionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!fullSessionRes.ok) throw new Error("Failed to fetch session details");
      const fullSession = await fullSessionRes.json();
      console.log("Full session response:", JSON.stringify(fullSession, null, 2));

      // Find current session from local state for display data
      const currentSession = sessions.find((s) => s.id === sessionId);
      if (!currentSession) return;

      // Handle both flat (mentorId) and nested (mentor.id) response structures
      // Also check for mentor object with id property at different nesting levels
      const studentId = fullSession.studentId ?? fullSession.student?.id ?? currentSession.studentId;
      const mentorId = fullSession.mentorId ?? fullSession.mentor?.id ?? currentSession.mentorId;
      const subjectId = fullSession.subjectId ?? fullSession.subject?.id ?? currentSession.subjectId;

      console.log("Extracted IDs:", { studentId, mentorId, subjectId });

      // Validate that we have all required IDs
      if (!mentorId) {
        throw new Error("Mentor ID not found in session data");
      }
      if (!subjectId) {
        throw new Error("Subject ID not found in session data");
      }

      const res = await fetch(`${API_BASE_URL}/api/v1/sessions/${sessionId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // studentId,
          // // mentorId,
          // subjectId,
          sessionAt: fullSession.sessionAt || currentSession.sessionAt,
          durationMinutes: fullSession.durationMinutes || currentSession.durationMinutes,
          sessionStatus: updates.sessionStatus || fullSession.sessionStatus,
          paymentStatus: updates.paymentStatus || fullSession.paymentStatus,
          meetingLink: updates.meetingLink !== undefined ? updates.meetingLink : fullSession.meetingLink,
        }),

        
      });
      console.log("Sending to Server:", { studentId, mentorId, subjectId });

      

     

      console.log("Current Session:", currentSession);
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Update failed:", errorText);
        throw new Error("Failed to update session");
      }

      // Refresh data
      await fetchSessions();

      toast({
        title: "Success",
        description: "Session updated successfully",
      });
    } catch (error) {
      console.error("Error updating session:", error);
      toast({
        title: "Error",
        description: "Failed to update session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  // Confirm payment (PENDING → CONFIRMED)
  const handleConfirmPayment = (sessionId: number) => {
    updateSession(sessionId, { paymentStatus: "CONFIRMED" });
  };

  // Mark complete (SCHEDULED → COMPLETED)
  const handleMarkComplete = (sessionId: number) => {
    updateSession(sessionId, {
      sessionStatus: "COMPLETED",
      paymentStatus: "COMPLETED",
    });
  };

  // Add meeting link
  const handleAddMeetingLink = () => {
    if (!meetingLinkDialog.sessionId || !newMeetingLink.trim()) return;
    updateSession(meetingLinkDialog.sessionId, { meetingLink: newMeetingLink });
    setMeetingLinkDialog({ open: false, sessionId: null, currentLink: "" });
    setNewMeetingLink("");
  };

  // Update session status
  const handleUpdateStatus = () => {
    if (!statusDialog.sessionId) return;
    updateSession(statusDialog.sessionId, {
      sessionStatus: newSessionStatus,
      paymentStatus: newPaymentStatus,
    });
    setStatusDialog({ open: false, sessionId: null, currentStatus: null, currentPaymentStatus: null });
  };

  // Delete session
  const handleDeleteSession = async (sessionId: number) => {
    try {
      setUpdating(sessionId);
      const token = await getToken({ template: "skill-mentor" });
      const res = await fetch(`${API_BASE_URL}/api/v1/sessions/${sessionId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to delete session");

      setSessions((prev) => prev.filter((s) => s.id !== sessionId));

      toast({
        title: "Success",
        description: "Session deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting session:", error);
      toast({
        title: "Error",
        description: "Failed to delete session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  // Filter and sort sessions
  const filteredSessions = useMemo(() => {
    let result = [...sessions];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (session) =>
          session.studentName?.toLowerCase().includes(term) ||
          session.student?.firstName?.toLowerCase().includes(term) ||
          session.student?.lastName?.toLowerCase().includes(term) ||
          session.mentorName?.toLowerCase().includes(term) ||
          session.mentor?.firstName?.toLowerCase().includes(term) ||
          session.mentor?.lastName?.toLowerCase().includes(term) ||
          session.subjectName?.toLowerCase().includes(term) ||
          session.subject?.subjectName?.toLowerCase().includes(term) ||
          session.id.toString().includes(term)
      );
    }

    // Session status filter
    if (sessionStatusFilter !== "all") {
      result = result.filter(
        (session) => session.sessionStatus === sessionStatusFilter
      );
    }

    // Payment status filter
    if (paymentStatusFilter !== "all") {
      result = result.filter(
        (session) => session.paymentStatus === paymentStatusFilter
      );
    }

    // Date range filter
    if (dateFrom) {
      result = result.filter(
        (session) => new Date(session.sessionAt) >= new Date(dateFrom)
      );
    }
    if (dateTo) {
      result = result.filter(
        (session) => new Date(session.sessionAt) <= new Date(dateTo + "T23:59:59")
      );
    }

    // Sort
    result.sort((a, b) => {
      let aVal: string | number = "";
      let bVal: string | number = "";

      switch (sortField) {
        case "id":
          aVal = a.id;
          bVal = b.id;
          break;
        case "sessionAt":
          aVal = new Date(a.sessionAt).getTime();
          bVal = new Date(b.sessionAt).getTime();
          break;
        case "studentName":
          aVal = (a.studentName || `${a.student?.firstName || ""} ${a.student?.lastName || ""}`).toLowerCase();
          bVal = (b.studentName || `${b.student?.firstName || ""} ${b.student?.lastName || ""}`).toLowerCase();
          break;
        case "mentorName":
          aVal = (a.mentorName || `${a.mentor?.firstName || ""} ${a.mentor?.lastName || ""}`).toLowerCase();
          bVal = (b.mentorName || `${b.mentor?.firstName || ""} ${b.mentor?.lastName || ""}`).toLowerCase();
          break;
        case "subjectName":
          aVal = (a.subjectName || a.subject?.subjectName || "").toLowerCase();
          bVal = (b.subjectName || b.subject?.subjectName || "").toLowerCase();
          break;
        case "durationMinutes":
          aVal = a.durationMinutes;
          bVal = b.durationMinutes;
          break;
        case "paymentStatus":
          aVal = a.paymentStatus;
          bVal = b.paymentStatus;
          break;
        case "sessionStatus":
          aVal = a.sessionStatus;
          bVal = b.sessionStatus;
          break;
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [
    sessions,
    searchTerm,
    sessionStatusFilter,
    paymentStatusFilter,
    dateFrom,
    dateTo,
    sortField,
    sortDirection,
  ]);

  // Pagination
  const totalPages = Math.ceil(filteredSessions.length / pageSize);
  const paginatedSessions = filteredSessions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sessionStatusFilter, paymentStatusFilter, dateFrom, dateTo]);

  // Sort handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Format helpers
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Status badge configs
  const getSessionStatusConfig = (status: Session["sessionStatus"]) => {
    switch (status) {
      case "SCHEDULED":
        return {
          label: "Scheduled",
          className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
          icon: Clock,
        };
      case "COMPLETED":
        return {
          label: "Completed",
          className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
          icon: CheckCircle2,
        };
      case "CANCELLED":
        return {
          label: "Cancelled",
          className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
          icon: XCircle,
        };
      case "NO_SHOW":
        return {
          label: "No Show",
          className: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
          icon: AlertCircle,
        };
      default:
        return {
          label: status,
          className: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300",
          icon: Clock,
        };
    }
  };

  const getPaymentStatusConfig = (status: Session["paymentStatus"]) => {
    switch (status) {
      case "PENDING":
        return {
          label: "Pending",
          className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
          icon: AlertCircle,
        };
      case "CONFIRMED":
        return {
          label: "Confirmed",
          className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
          icon: CreditCard,
        };
      case "COMPLETED":
        return {
          label: "Completed",
          className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
          icon: CheckCircle2,
        };
      case "REFUNDED":
        return {
          label: "Refunded",
          className: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
          icon: XCircle,
        };
      default:
        return {
          label: status,
          className: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300",
          icon: AlertCircle,
        };
    }
  };

  // Stats
  const stats = useMemo(() => {
    return {
      total: sessions.length,
      scheduled: sessions.filter((s) => s.sessionStatus === "SCHEDULED").length,
      completed: sessions.filter((s) => s.sessionStatus === "COMPLETED").length,
      pendingPayment: sessions.filter((s) => s.paymentStatus === "PENDING").length,
    };
  }, [sessions]);

  const SortableHeader = ({
    field,
    children,
  }: {
    field: SortField;
    children: React.ReactNode;
  }) => (
    <TableHead
      className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors select-none"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        <ArrowUpDown
          className={`w-4 h-4 ${sortField === field ? "text-blue-600" : "text-slate-400"
            }`}
        />
      </div>
    </TableHead>
  );

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 p-4 md:p-6 lg:p-8">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
              Manage Bookings
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              View and manage all session bookings
            </p>
          </div>
          <Button
            onClick={fetchSessions}
            disabled={loading}
            variant="outline"
            className="w-fit"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-slate-200 dark:border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-500 rounded-xl">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {stats.total}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Total Sessions
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500 rounded-xl">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {stats.scheduled}
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    Scheduled
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500 rounded-xl">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {stats.completed}
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Completed
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 border-yellow-200 dark:border-yellow-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-500 rounded-xl">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                    {stats.pendingPayment}
                  </p>
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">
                    Pending Payment
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters Card */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-slate-500" />
              <CardTitle className="text-lg">Filters</CardTitle>
            </div>
            <CardDescription>
              Search and filter sessions by various criteria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <Label htmlFor="search" className="text-sm font-medium mb-2 block">
                  Search
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="search"
                    placeholder="Search by student, mentor, subject..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Session Status */}
              <div>
                <Label htmlFor="session-status" className="text-sm font-medium mb-2 block">
                  Session Status
                </Label>
                <Select value={sessionStatusFilter} onValueChange={setSessionStatusFilter}>
                  <SelectTrigger id="session-status">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    <SelectItem value="NO_SHOW">No Show</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Payment Status */}
              <div>
                <Label htmlFor="payment-status" className="text-sm font-medium mb-2 block">
                  Payment Status
                </Label>
                <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
                  <SelectTrigger id="payment-status">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Payments</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="REFUNDED">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Page Size */}
              <div>
                <Label htmlFor="page-size" className="text-sm font-medium mb-2 block">
                  Per Page
                </Label>
                <Select value={pageSize.toString()} onValueChange={(v) => setPageSize(Number(v))}>
                  <SelectTrigger id="page-size">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Date Range Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              <div>
                <Label htmlFor="date-from" className="text-sm font-medium mb-2 flex items-center gap-2">
                  <CalendarRange className="w-4 h-4" />
                  From Date
                </Label>
                <Input
                  id="date-from"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="date-to" className="text-sm font-medium mb-2 block">
                  To Date
                </Label>
                <Input
                  id="date-to"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSearchTerm("");
                    setSessionStatusFilter("all");
                    setPaymentStatusFilter("all");
                    setDateFrom("");
                    setDateTo("");
                  }}
                  className="text-slate-600 hover:text-slate-900"
                >
                  Clear Filters
                </Button>
              </div>
            </div>

            {/* Results count */}
            <div className="mt-4 pt-4 border-t text-sm text-slate-600 dark:text-slate-400">
              Showing {paginatedSessions.length} of {filteredSessions.length} sessions
              {filteredSessions.length !== sessions.length && (
                <span className="text-slate-400"> (filtered from {sessions.length} total)</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-slate-500" />
              <CardTitle className="text-lg">Sessions</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                <p className="text-slate-500">Loading sessions...</p>
              </div>
            ) : paginatedSessions.length === 0 ? (
              <div className="text-center py-16">
                <Calendar className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  No sessions found
                </h3>
                <p className="text-slate-500 dark:text-slate-400">
                  {sessions.length === 0
                    ? "There are no sessions in the system yet."
                    : "Try adjusting your search or filter criteria."}
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
                  <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                      <TableRow>
                        <SortableHeader field="id">ID</SortableHeader>
                        <SortableHeader field="studentName">Student</SortableHeader>
                        <SortableHeader field="mentorName">Mentor</SortableHeader>
                        <SortableHeader field="subjectName">Subject</SortableHeader>
                        <SortableHeader field="sessionAt">Date/Time</SortableHeader>
                        <SortableHeader field="durationMinutes">Duration</SortableHeader>
                        <TableHead>Meeting Link</TableHead>
                        <SortableHeader field="paymentStatus">Payment</SortableHeader>
                        <SortableHeader field="sessionStatus">Status</SortableHeader>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedSessions.map((session) => {
                        const sessionStatus = getSessionStatusConfig(session.sessionStatus);
                        const paymentStatus = getPaymentStatusConfig(session.paymentStatus);
                        const SessionIcon = sessionStatus.icon;
                        const PaymentIcon = paymentStatus.icon;
                        const isUpdating = updating === session.id;

                        return (
                          <TableRow
                            key={session.id}
                            className={isUpdating ? "opacity-50" : ""}
                          >
                            {/* ID */}
                            <TableCell className="font-mono text-sm text-slate-500">
                              #{session.id}
                            </TableCell>

                            {/* Student */}
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                                  {(session.studentName || session.student?.firstName || "S").charAt(0)}
                                  {(session.student?.lastName || "").charAt(0)}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-medium text-slate-900 dark:text-white truncate">
                                    {session.studentName || (session.student
                                      ? `${session.student.firstName} ${session.student.lastName}`
                                      : "Unknown Student")}
                                    <span className="ml-1 text-xs text-slate-400 font-mono">
                                      (#{session.studentId || session.student?.id || "-"})
                                    </span>
                                  </p>
                                  <p className="text-xs text-slate-500 truncate">
                                    {session.studentEmail || session.student?.email || "-"}
                                  </p>
                                </div>
                              </div>
                            </TableCell>

                            {/* Mentor */}
                            <TableCell>
                              <div className="flex items-center gap-3">
                                {(session.mentorProfileImageUrl || session.mentor?.profileImageUrl) ? (
                                  <img
                                    src={session.mentorProfileImageUrl || session.mentor?.profileImageUrl}
                                    alt=""
                                    className="w-8 h-8 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
                                    {(session.mentorName || session.mentor?.firstName || "M").charAt(0)}
                                    {(session.mentor?.lastName || "").charAt(0)}
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <p className="font-medium text-slate-900 dark:text-white truncate">
                                    {session.mentorName || (session.mentor
                                      ? `${session.mentor.firstName} ${session.mentor.lastName}`
                                      : "Unknown Mentor")}
                                    <span className="ml-1 text-xs text-slate-400 font-mono">
                                      (#{session.mentorId || session.mentor?.id || "-"})
                                    </span>
                                  </p>
                                  <p className="text-xs text-slate-500 truncate">
                                    {session.mentorEmail || session.mentor?.email || "-"}
                                  </p>
                                </div>
                              </div>
                            </TableCell>

                            {/* Subject */}
                            <TableCell>
                              <div className="space-y-1">
                                <Badge variant="outline" className="font-medium">
                                  {session.subjectName || session.subject?.subjectName || "Unknown Subject"}
                                </Badge>
                                <p className="text-xs text-slate-400 font-mono">
                                  ID: #{session.subjectId || session.subject?.id || "-"}
                                </p>
                              </div>
                            </TableCell>

                            {/* Date/Time */}
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5 text-sm">
                                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                  {formatDate(session.sessionAt)}
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                  <Clock className="w-3 h-3" />
                                  {formatTime(session.sessionAt)}
                                </div>
                              </div>
                            </TableCell>

                            {/* Duration */}
                            <TableCell>
                              <span className="text-sm text-slate-700 dark:text-slate-300">
                                {session.durationMinutes} min
                              </span>
                            </TableCell>

                            {/* Meeting Link */}
                            <TableCell>
                              {session.meetingLink ? (
                                <a
                                  href={session.meetingLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 text-xs font-medium hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors max-w-[150px]"
                                >
                                  <Video className="w-3.5 h-3.5 shrink-0" />
                                  <span className="truncate">{session.meetingLink.replace(/^https?:\/\//, "").substring(0, 20)}...</span>
                                </a>
                              ) : (
                                <span className="text-xs text-slate-400 dark:text-slate-500 italic">
                                  No link added
                                </span>
                              )}
                            </TableCell>

                            {/* Payment Status */}
                            <TableCell>
                              <Badge className={paymentStatus.className}>
                                <PaymentIcon className="w-3 h-3 mr-1" />
                                {paymentStatus.label}
                              </Badge>
                            </TableCell>

                            {/* Session Status */}
                            <TableCell>
                              <Badge className={sessionStatus.className}>
                                <SessionIcon className="w-3 h-3 mr-1" />
                                {sessionStatus.label}
                              </Badge>
                            </TableCell>

                            {/* Actions */}
                            <TableCell>
                              <div className="flex items-center justify-end gap-2">
                                {/* Confirm Payment Button */}
                                {session.paymentStatus === "PENDING" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleConfirmPayment(session.id)}
                                    disabled={isUpdating}
                                    className="text-green-600 border-green-200 hover:bg-green-50 hover:border-green-300"
                                  >
                                    {isUpdating ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <>
                                        <CreditCard className="w-4 h-4 mr-1" />
                                        Confirm
                                      </>
                                    )}
                                  </Button>
                                )}

                                {/* Mark Complete Button */}
                                {session.sessionStatus === "SCHEDULED" &&
                                  session.paymentStatus === "CONFIRMED" && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleMarkComplete(session.id)}
                                      disabled={isUpdating}
                                      className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                                    >
                                      {isUpdating ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                      ) : (
                                        <>
                                          <CheckCircle2 className="w-4 h-4 mr-1" />
                                          Complete
                                        </>
                                      )}
                                    </Button>
                                  )}

                                {/* Add Meeting Link Button */}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setMeetingLinkDialog({
                                      open: true,
                                      sessionId: session.id,
                                      currentLink: session.meetingLink || "",
                                    });
                                    setNewMeetingLink(session.meetingLink || "");
                                  }}
                                  disabled={isUpdating}
                                  className="text-purple-600 border-purple-200 hover:bg-purple-50 hover:border-purple-300"
                                >
                                  <Video className="w-4 h-4 mr-1" />
                                  {session.meetingLink ? "Edit" : "Add"} Link
                                </Button>

                                {/* Change Status Button */}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setStatusDialog({
                                      open: true,
                                      sessionId: session.id,
                                      currentStatus: session.sessionStatus,
                                      currentPaymentStatus: session.paymentStatus,
                                    });
                                    setNewSessionStatus(session.sessionStatus);
                                    setNewPaymentStatus(session.paymentStatus);
                                  }}
                                  disabled={isUpdating}
                                  className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                                >
                                  <Users className="w-4 h-4 mr-1" />
                                  Status
                                </Button>

                                {/* Delete Button */}
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      disabled={isUpdating}
                                      className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                                    >
                                      <XCircle className="w-4 h-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogTitle>Delete Session</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete session #{session.id}? This
                                      action cannot be undone.
                                    </AlertDialogDescription>
                                    <div className="flex justify-end gap-3 mt-4">
                                      <AlertDialogCancel asChild>
                                        <Button variant="outline">Cancel</Button>
                                      </AlertDialogCancel>
                                      <AlertDialogAction asChild>
                                        <Button
                                          variant="destructive"
                                          onClick={() => handleDeleteSession(session.id)}
                                        >
                                          Delete
                                        </Button>
                                      </AlertDialogAction>
                                    </div>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <p className="text-sm text-slate-500">
                      Page {currentPage} of {totalPages}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Previous
                      </Button>

                      {/* Page numbers */}
                      <div className="hidden sm:flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum: number;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }

                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              size="sm"
                              className="w-9"
                              onClick={() => setCurrentPage(pageNum)}
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Meeting Link Dialog */}
      <Dialog
        open={meetingLinkDialog.open}
        onOpenChange={(open) => {
          if (!open) {
            setMeetingLinkDialog({ open: false, sessionId: null, currentLink: "" });
            setNewMeetingLink("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Video className="w-5 h-5 text-purple-600" />
              {meetingLinkDialog.currentLink ? "Edit Meeting Link" : "Add Meeting Link"}
            </DialogTitle>
            <DialogDescription>
              Enter the video conferencing link for this session (e.g., Zoom, Google Meet)
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Label htmlFor="meeting-link" className="text-sm font-medium mb-2 block">
              Meeting URL
            </Label>
            <div className="relative">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="meeting-link"
                placeholder="https://zoom.us/j/..."
                value={newMeetingLink}
                onChange={(e) => setNewMeetingLink(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setMeetingLinkDialog({ open: false, sessionId: null, currentLink: "" });
                setNewMeetingLink("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddMeetingLink}
              disabled={!newMeetingLink.trim() || updating !== null}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {updating !== null ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Video className="w-4 h-4 mr-2" />
              )}
              Save Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Session Status Dialog */}
      <Dialog
        open={statusDialog.open}
        onOpenChange={(open) => {
          if (!open) {
            setStatusDialog({ open: false, sessionId: null, currentStatus: null, currentPaymentStatus: null });
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Update Session Status
            </DialogTitle>
            <DialogDescription>
              Change the session and payment status for this booking
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {/* Session Status */}
            <div>
              <Label htmlFor="new-session-status" className="text-sm font-medium mb-2 block">
                Session Status
              </Label>
              <Select
                value={newSessionStatus}
                onValueChange={(val) => setNewSessionStatus(val as Session["sessionStatus"])}
              >
                <SelectTrigger id="new-session-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SCHEDULED">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-500" />
                      Scheduled
                    </div>
                  </SelectItem>
                  <SelectItem value="COMPLETED">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      Completed
                    </div>
                  </SelectItem>
                  <SelectItem value="CANCELLED">
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-500" />
                      Cancelled
                    </div>
                  </SelectItem>
                  <SelectItem value="NO_SHOW">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-orange-500" />
                      No Show
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Payment Status */}
            <div>
              <Label htmlFor="new-payment-status" className="text-sm font-medium mb-2 block">
                Payment Status
              </Label>
              <Select
                value={newPaymentStatus}
                onValueChange={(val) => setNewPaymentStatus(val as Session["paymentStatus"])}
              >
                <SelectTrigger id="new-payment-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-500" />
                      Pending
                    </div>
                  </SelectItem>
                  <SelectItem value="CONFIRMED">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-blue-500" />
                      Confirmed
                    </div>
                  </SelectItem>
                  <SelectItem value="COMPLETED">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      Completed
                    </div>
                  </SelectItem>
                  <SelectItem value="REFUNDED">
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-purple-500" />
                      Refunded
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setStatusDialog({ open: false, sessionId: null, currentStatus: null, currentPaymentStatus: null });
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateStatus}
              disabled={updating !== null}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {updating !== null ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <CheckCircle2 className="w-4 h-4 mr-2" />
              )}
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
