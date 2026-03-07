import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import {
  CalendarDays,
  Clock,
  BookOpen,
  Video,
  CheckCircle2,
  GraduationCap,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Users,
  ExternalLink,
  AlertCircle,
  CreditCard,
} from "lucide-react";
import { StatusPill } from "@/components/StatusPill";
import { getMyEnrollments } from "@/lib/api";
import type { Enrollment } from "@/types";
import { useNavigate, Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useNavigate();

  useEffect(() => {
    async function fetchEnrollments() {
      if (!user) return;
      setLoading(true);
      const token = await getToken({ template: "skill-mentor" });
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const data = await getMyEnrollments(token);
        setEnrollments(data);
      } catch (err) {
        console.error("Failed to fetch enrollments", err);
      } finally {
        setLoading(false);
      }
    }

    if (isLoaded && isSignedIn) {
      fetchEnrollments();
    }
  }, [isLoaded, isSignedIn, getToken, user]);

  // Calculate statistics - only count sessions with approved payment
  const approvedEnrollments = enrollments.filter(
    (e) => e.paymentStatus === "APPROVED"
  );
  const upcomingSessions = approvedEnrollments.filter(
    (e) => e.sessionStatus === "SCHEDULED" && new Date(e.sessionAt) > new Date()
  ).length;
  const completedSessions = approvedEnrollments.filter(
    (e) => e.sessionStatus === "COMPLETED"
  ).length;
  const totalHours = approvedEnrollments.reduce(
    (acc, e) => acc + (e.durationMinutes || 60) / 60,
    0
  );
  const pendingPaymentsCount = enrollments.filter(
    (e) => e.paymentStatus === "PENDING"
  ).length;

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  // Format date nicely
  const formatSessionDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    }
    if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    }
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get status color for session
  const getSessionStatusConfig = (status: string) => {
    const configs: Record<string, { bg: string; text: string; label: string }> = {
      SCHEDULED: {
        bg: "bg-blue-100 dark:bg-blue-900/30",
        text: "text-blue-700 dark:text-blue-400",
        label: "Upcoming",
      },
      IN_PROGRESS: {
        bg: "bg-yellow-100 dark:bg-yellow-900/30",
        text: "text-yellow-700 dark:text-yellow-400",
        label: "In Progress",
      },
      COMPLETED: {
        bg: "bg-green-100 dark:bg-green-900/30",
        text: "text-green-700 dark:text-green-400",
        label: "Completed",
      },
      CANCELLED: {
        bg: "bg-red-100 dark:bg-red-900/30",
        text: "text-red-700 dark:text-red-400",
        label: "Cancelled",
      },
    };
    return configs[status] || configs.SCHEDULED;
  };

  // Loading state
  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Skeleton Header */}
          <div className="mb-8 animate-pulse">
            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-64 mb-2"></div>
            <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-lg w-96"></div>
          </div>

          {/* Skeleton Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"
              ></div>
            ))}
          </div>

          {/* Skeleton Cards */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    router("/login");
    return null;
  }

  // Empty state
  if (!enrollments.length) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-1">
              {getGreeting()}, {user?.firstName || "there"}! 👋
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Welcome to SkillMentor - Your learning journey starts here
            </p>
          </div>

          {/* Empty State Card */}
          <Card className="max-w-2xl mx-auto mt-16">
            <CardContent className="pt-12 pb-12 text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center">
                <GraduationCap className="w-12 h-12 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                No courses yet
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
                Start your learning journey by exploring our expert mentors and
                enrolling in courses that match your goals.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/">
                  <Button
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Browse Mentors
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>

              {/* Quick Tips */}
              <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
                  How it works
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                      <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">
                        1
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white text-sm">
                        Find a mentor
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Browse expert mentors in your field
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                      <span className="text-purple-600 dark:text-purple-400 font-bold text-sm">
                        2
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white text-sm">
                        Book a session
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Choose a time that works for you
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                      <span className="text-green-600 dark:text-green-400 font-bold text-sm">
                        3
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white text-sm">
                        Start learning
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Join live sessions and grow
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-1">
            {getGreeting()}, {user?.firstName || "there"}! 👋
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Track your learning progress and upcoming sessions
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800 hover:shadow-lg transition-shadow">
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center shrink-0">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {approvedEnrollments.length}
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                    Active Courses
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800 hover:shadow-lg transition-shadow">
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center shrink-0">
                  <CalendarDays className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                    {upcomingSessions}
                  </p>
                  <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                    Upcoming
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800 hover:shadow-lg transition-shadow">
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {completedSessions}
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                    Completed
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800 hover:shadow-lg transition-shadow">
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                    {totalHours.toFixed(1)}h
                  </p>
                  <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                    Learning Time
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pending Payments Card */}
          {pendingPaymentsCount > 0 && (
            <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 border-yellow-200 dark:border-yellow-800 hover:shadow-lg transition-shadow">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-yellow-500 flex items-center justify-center shrink-0">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                      {pendingPaymentsCount}
                    </p>
                    <p className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
                      Pending Payments
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-blue-600" />
            My Enrolled Courses
          </h2>
          <Link to="/">
            <Button variant="outline" size="sm">
              <Sparkles className="w-4 h-4 mr-2" />
              Browse More
            </Button>
          </Link>
        </div>

        {/* Course Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {enrollments.map((enrollment) => {
            const statusConfig = getSessionStatusConfig(enrollment.sessionStatus);
            const isUpcoming =
              enrollment.sessionStatus === "SCHEDULED" &&
              new Date(enrollment.sessionAt) > new Date();

            return (
              <Card
                key={enrollment.id}
                className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700"
              >
                {/* Card Header with Gradient */}
                <div className="relative h-32 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 p-4">
                  {/* Pattern Overlay */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,white_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <StatusPill status={enrollment.paymentStatus} />
                  </div>

                  {/* Mentor Avatar */}
                  <div className="absolute -bottom-10 left-4">
                    <div className="w-20 h-20 rounded-2xl border-4 border-white dark:border-slate-800 shadow-lg overflow-hidden bg-white dark:bg-slate-800">
                      {enrollment.mentorProfileImageUrl ? (
                        <>
                                                

                        <img
                          src={enrollment.mentorProfileImageUrl}
                          alt={enrollment.mentorName}
                          className="w-full h-full object-cover object-top"
                        />
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl font-bold">
                          {enrollment.mentorName.charAt(0)}
                        </div>
                      )}
                      
                    </div>
                  </div>

                  {/* Session Status */}
                  <div className="absolute bottom-3 right-3">
                    <Badge
                      className={`${statusConfig.bg} ${statusConfig.text} border-0`}
                    >
                      {statusConfig.label}
                    </Badge>
                  </div>
                </div>

                <CardContent className="pt-14 pb-5">
                  {/* Subject Name */}
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {enrollment.subjectName}
                  </h3>

                  {/* Mentor Info */}
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-4">
                    <Users className="w-4 h-4" />
                    <span>Mentor: {enrollment.mentorName}</span>
                  </div>

                  {/* Session Time */}
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 mb-4">
                    <CalendarDays className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {isUpcoming ? "Next Session" : "Session"}
                      </p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {formatSessionDate(enrollment.sessionAt)}
                      </p>
                    </div>
                    {enrollment.durationMinutes && (
                      <Badge variant="outline" className="ml-auto">
                        {enrollment.durationMinutes} min
                      </Badge>
                    )}
                  </div>

                  {/* Action Button */}
                  {!enrollment.paymentStatus ? (
                    <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                      <AlertCircle className="w-5 h-5" />
                      No Payment Record
                    </div>
                  ) : enrollment.paymentStatus === "PENDING" ? (
                    <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 font-medium">
                      <AlertCircle className="w-5 h-5" />
                      Payment Pending - Awaiting Approval
                    </div>
                  ) : enrollment.paymentStatus === "REJECTED" ? (
                    <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 font-medium">
                      <AlertCircle className="w-5 h-5" />
                      Payment Rejected
                    </div>
                  ) : enrollment.meetingLink  ? (

                    <>
                    {console.log("Meeting Link:", enrollment.meetingLink)}
                    <a
                      href={enrollment.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25">
                        <Video className="w-4 h-4 mr-2" />
                        Join Session
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </Button>
                    </a>
                    </>
                  ) : enrollment.sessionStatus === "COMPLETED" ? (
                    <div className="flex items-center justify-center gap-2 py-2 text-green-600 dark:text-green-400 font-medium">
                      <CheckCircle2 className="w-5 h-5" />
                      Session Completed
                      
                    </div>
                      
                    

                  ) : (
                    <>
                    {console.log("Awaiting session link:", enrollment.meetingLink)}
                    <Button variant="outline" className="w-full" disabled>
                      <Clock className="w-4 h-4 mr-2" />
                      Awaiting Session Link
                    </Button>

                    </>
                  ) }
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions Footer */}
        <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 border border-blue-100 dark:border-blue-900">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Keep learning!
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Explore new subjects and expand your skills
                </p>
              </div>
            </div>
            <Link to="/">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg">
                <Sparkles className="w-4 h-4 mr-2" />
                Discover More Mentors
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
