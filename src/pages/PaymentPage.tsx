import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { useToast } from "@/components/hooks/use-toast";
import { useAuth, useUser } from "@clerk/clerk-react";
import { enrollInSession, createPayment, uploadPaymentReceipt, getPaymentById, getStudentByClerkId } from "@/lib/api";
import type { Payment } from "@/lib/api";

// Icons as SVG components
const CreditCardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="14" x="2" y="5" rx="2"/>
    <line x1="2" x2="22" y1="10" y2="10"/>
  </svg>
);

const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="m9 12 2 2 4-4"/>
  </svg>
);

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const XCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="m15 9-6 6"/>
    <path d="m9 9 6 6"/>
  </svg>
);

const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/>
    <line x1="12" x2="12" y1="3" y2="15"/>
  </svg>
);

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
    <line x1="16" x2="16" y1="2" y2="6"/>
    <line x1="8" x2="8" y1="2" y2="6"/>
    <line x1="3" x2="21" y1="10" y2="10"/>
  </svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const BookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
  </svg>
);

const SpinnerIcon = () => (
  <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
);

const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 19-7-7 7-7"/>
    <path d="M19 12H5"/>
  </svg>
);

const ImageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
    <circle cx="9" cy="9" r="2"/>
    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
  </svg>
);

export default function PaymentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { sessionId } = useParams();
  const { toast } = useToast();
  const { getToken } = useAuth();
  const { user } = useUser();
  const [file, setFile] = useState<File | null>(null);
  const [note, setNote] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  console.log(searchParams.get("mentorId"))
  const date = searchParams.get("date");
  const courseTitle = searchParams.get("courseTitle");
  const mentorId = searchParams.get("mentorId");
  const mentorName = searchParams.get("mentorName");
  const subjectId = searchParams.get("subjectId");
  const sessionDate = date ? new Date(date).toLocaleDateString("en-US", { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }) : null;

  useEffect(() => {
    async function fetchPayment() {
      if (!sessionId) return;
      setIsLoading(true);
      try {
        const token = await getToken({ template: "skill-mentor" });
        if (!token) throw new Error("Not authenticated");

        const data = await getPaymentById(token, Number(sessionId));
        setPayment(data);
      } catch {
        console.log("No existing payment found");
      } finally {
        setIsLoading(false);
      }
    }
    fetchPayment();
  }, [sessionId, getToken]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();
    if (!file || !date || !mentorId || !subjectId) return;

    setIsUploading(true);

    try {
      const token = await getToken({ template: "skill-mentor" });
      if (!token) throw new Error("Not authenticated");

      const clerkId = user?.id;
      if (!clerkId) throw new Error("User not found");
      
      const student = await getStudentByClerkId(token, clerkId);
      const studentDbId = student.id;

      const enrollment = await enrollInSession(token, {
        mentorId: Number(mentorId),
        subjectId: Number(subjectId),
        sessionAt: date,
        durationMinutes: 60,
      });

      const receiptUrl = await uploadPaymentReceipt(file);

      const paymentToken = await getToken({ template: "skill-mentor", skipCache: true });
      if (!paymentToken) throw new Error("Not authenticated");

      await createPayment(paymentToken, {
        studentId: studentDbId,
        sessionId: enrollment.id,
        receipt_url: receiptUrl,
        note: note || `Payment for session with ${mentorName || "mentor"}`,
      });

      toast({
        title: "🎉 Payment Submitted Successfully!",
        description:
          "Your bank slip has been uploaded. Please wait for admin approval.",
      });

      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "There was a problem submitting your payment. Please try again.",
        variant: "destructive",
      });
      setIsUploading(false);
    }
  };

  // Payment Status View
  if (payment) {
    const statusConfig = {
      APPROVED: {
        icon: <CheckCircleIcon />,
        bgGradient: "from-emerald-500 to-teal-600",
        iconBg: "bg-emerald-100",
        iconColor: "text-emerald-600",
        label: "Payment Approved",
        subtitle: "Your session has been confirmed!"
      },
      REJECTED: {
        icon: <XCircleIcon />,
        bgGradient: "from-red-500 to-rose-600",
        iconBg: "bg-red-100",
        iconColor: "text-red-600",
        label: "Payment Rejected",
        subtitle: "Please contact support for assistance"
      },
      PENDING: {
        icon: <ClockIcon />,
        bgGradient: "from-amber-500 to-orange-600",
        iconBg: "bg-amber-100",
        iconColor: "text-amber-600",
        label: "Pending Approval",
        subtitle: "Your payment is being reviewed"
      }
    };
    
    const status = statusConfig[payment.paymentStatus as keyof typeof statusConfig] || statusConfig.PENDING;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8 px-4">
        <div className="max-w-lg mx-auto">
          {/* Header */}
          <div className={`bg-gradient-to-r ${status.bgGradient} rounded-t-3xl p-8 text-white text-center relative overflow-hidden`}>
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full"></div>
            <div className="relative z-10">
              <div className={`inline-flex items-center justify-center w-20 h-20 ${status.iconBg} rounded-full mb-4 ${status.iconColor}`}>
                {status.icon}
              </div>
              <h1 className="text-2xl font-bold mb-2">{status.label}</h1>
              <p className="text-white/90 text-sm">{status.subtitle}</p>
            </div>
          </div>

          {/* Content Card */}
          <Card className="border-0 shadow-2xl rounded-t-none rounded-b-3xl overflow-hidden">
            <CardContent className="p-6 space-y-6">
              {/* Receipt Preview */}
              {payment.receipt_url && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <ImageIcon />
                    <span>Uploaded Receipt</span>
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-sm opacity-20 group-hover:opacity-30 transition-opacity"></div>
                    <div className="relative bg-white border-2 border-slate-100 p-3 rounded-2xl">
                      <img
                        src={payment.receipt_url}
                        alt="Payment Receipt"
                        className="w-full h-auto rounded-xl shadow-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Note */}
              {payment.note && (
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <p className="text-sm text-slate-500 mb-1">Note</p>
                  <p className="text-slate-700">{payment.note}</p>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="p-6 pt-0">
              <Button 
                onClick={() => navigate("/dashboard")} 
                className="w-full h-14 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5"
              >
                <ArrowLeftIcon />
                <span className="ml-2">Back to Dashboard</span>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg mb-4">
            <div className="text-blue-600">
              <SpinnerIcon />
            </div>
          </div>
          <p className="text-slate-600 font-medium">Loading payment details...</p>
        </div>
      </div>
    );
  }

  // Main Payment Form
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header Card */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-t-3xl p-8 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-white/5"></div>
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-4 rotate-3 hover:rotate-0 transition-transform">
              <CreditCardIcon />
            </div>
            <h1 className="text-2xl font-bold mb-2">Complete Your Payment</h1>
            <p className="text-blue-100 text-sm">Upload your bank transfer slip to confirm booking</p>
          </div>
        </div>

        {/* Main Form Card */}
        <Card className="border-0 shadow-2xl rounded-t-none rounded-b-3xl overflow-hidden">
          <form onSubmit={handleUpload}>
            <CardHeader className="pb-4">
              {/* Session Details */}
              <div className="space-y-3">
                {mentorName && (
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                    <div className="flex items-center justify-center w-10 h-10 bg-indigo-100 rounded-full text-indigo-600">
                      <UserIcon />
                    </div>
                    <div>
                      <p className="text-xs text-indigo-500 font-medium uppercase tracking-wide">Mentor</p>
                      <p className="font-semibold text-slate-800">{mentorName}</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  {courseTitle && (
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg text-blue-600">
                        <BookIcon />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-slate-400 font-medium">Course</p>
                        <p className="font-medium text-slate-700 text-sm truncate">{courseTitle}</p>
                      </div>
                    </div>
                  )}

                  {sessionDate && (
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center justify-center w-8 h-8 bg-emerald-100 rounded-lg text-emerald-600">
                        <CalendarIcon />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-slate-400 font-medium">Date</p>
                        <p className="font-medium text-slate-700 text-sm truncate">{sessionDate}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6 pt-2">
              {/* File Upload Area */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <ImageIcon />
                  Bank Transfer Slip
                </Label>
                
                <div
                  className={`relative border-2 border-dashed rounded-2xl transition-all duration-300 ${
                    isDragging 
                      ? "border-blue-500 bg-blue-50 scale-[1.02]" 
                      : file 
                        ? "border-emerald-300 bg-emerald-50" 
                        : "border-slate-200 hover:border-blue-400 hover:bg-slate-50"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input
                    id="slip"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    required
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  
                  {file ? (
                    <div className="p-4">
                      <div className="relative">
                        <img
                          src={URL.createObjectURL(file)}
                          alt="Bank Slip Preview"
                          className="w-full h-auto rounded-xl shadow-md"
                        />
                        <div className="absolute top-2 right-2 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-lg">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                          Uploaded
                        </div>
                      </div>
                      <p className="text-center text-sm text-slate-500 mt-3">
                        Click or drag to replace
                      </p>
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 transition-colors ${
                        isDragging ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-400"
                      }`}>
                        <UploadIcon />
                      </div>
                      <p className="font-semibold text-slate-700 mb-1">
                        {isDragging ? "Drop your file here" : "Upload your bank slip"}
                      </p>
                      <p className="text-sm text-slate-400">
                        Drag and drop or click to browse
                      </p>
                      <p className="text-xs text-slate-300 mt-2">
                        Supports: JPG, PNG, WEBP
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Note Input */}
              <div className="space-y-2">
                <Label htmlFor="note" className="text-sm font-semibold text-slate-700">
                  Note <span className="text-slate-400 font-normal">(Optional)</span>
                </Label>
                <Input
                  id="note"
                  type="text"
                  placeholder="Add a note about your payment..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="h-12 rounded-xl border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 transition-all"
                />
              </div>

              {/* Info Notice */}
              <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
                <div className="flex-shrink-0 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" x2="12" y1="8" y2="12"/>
                    <line x1="12" x2="12.01" y1="16" y2="16"/>
                  </svg>
                </div>
                <p className="text-sm text-amber-800">
                  Please upload a clear image of your bank transfer slip. Your payment will be verified by our admin team within 24 hours.
                </p>
              </div>
            </CardContent>

            <CardFooter className="p-6 pt-2">
              <Button
                type="submit"
                className="w-full h-14 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg"
                disabled={!file || isUploading}
              >
                {isUploading ? (
                  <span className="flex items-center justify-center gap-2">
                    <SpinnerIcon />
                    Processing Payment...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Submit Payment
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14"/>
                      <path d="m12 5 7 7-7 7"/>
                    </svg>
                  </span>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Security Badge */}
        <div className="flex items-center justify-center gap-2 mt-6 text-slate-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <span className="text-xs font-medium">Secure Payment Processing</span>
        </div>
      </div>
    </div>
  );
}
