import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Mail,
  Phone,
  Calendar,
  Clock,
  Share2,
  Star,
  Users,
  Briefcase,
  Building2,
  Award,
  BookOpen,
  Video,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowLeft,
  TrendingUp,
  GraduationCap,
  ThumbsUp,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";


interface Subject {
  id: number;
  name: string;
  subjectName?: string;
  description?: string;
  imageUrl?: string;
  enrollmentCount?: number;
}

interface Mentor {
  id: number;
  mentorId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  title?: string;
  profession?: string;
  company?: string;
  experienceYears?: number;
  bio?: string;
  profileImageUrl?: string;
  totalEnrollments?: number;
  isCertified?: boolean;
  startYear?: string;
  averageRating?: number;
  totalRatings?: number;
  subjects?: Subject[];
}

interface Session {
  id: number;
  sessionAt: string;
  durationMinutes?: number;
  sessionStatus: "SCHEDULED" | "COMPLETED" | "CANCELLED" | "IN_PROGRESS";
  meetingLink?: string;
  sessionNotes?: string;
  subject?: Subject;
}



export default function ProfilePage() {
  const { mentorId } = useParams();

  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);



  useEffect(() => {
    if (!mentorId) return;
    fetchMentorData();
  }, [mentorId]);

  const fetchMentorData = async () => {
    try {
      setLoading(true);

      // Fetch Mentor
      const mentorRes = await fetch(
        `${API_BASE_URL}/api/v1/mentors/${mentorId}`
      );

      if (!mentorRes.ok) throw new Error("Mentor not found");
      const mentorData: Mentor = await mentorRes.json();
      setMentor(mentorData);
      console.log("Fetched mentor data:", mentorData);

      // Fetch Sessions
      const sessionRes = await fetch(
        `${API_BASE_URL}/api/v1/sessions/mentor/${mentorId}`
      );

      if (sessionRes.ok) {
        const sessionData: Session[] = await sessionRes.json();
        setSessions(sessionData);
      }
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };



  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusConfig = (status: Session["sessionStatus"]) => {
    const configs = {
      SCHEDULED: {
        label: "Scheduled",
        className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
        icon: Calendar,
      },
      IN_PROGRESS: {
        label: "In Progress",
        className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
        icon: Video,
      },
      COMPLETED: {
        label: "Completed",
        className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
        icon: CheckCircle2,
      },
      CANCELLED: {
        label: "Cancelled",
        className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
        icon: XCircle,
      },
    };
    return configs[status] || configs.SCHEDULED;
  };

  /* ============================
     Loading State
  ============================ */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-lg font-medium text-slate-600 dark:text-slate-400">
            Loading mentor profile...
          </p>
        </div>
      </div>
    );
  }

  /* ============================
     Error State
  ============================ */

  if (error || !mentor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Mentor Not Found
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              {error || "The mentor profile you're looking for doesn't exist."}
            </p>
            <Link to="/">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const fullName = `${mentor.firstName} ${mentor.lastName}`;

  // Calculate statistics
  const completedSessions = sessions.filter(s => s.sessionStatus === "COMPLETED").length;
  const positiveReviewPercent = mentor.totalRatings && mentor.totalRatings > 0 
    ? Math.round((mentor.averageRating || 0) / 5 * 100) 
    : 0;
  const subjectCount = mentor.subjects?.length || 0;
  

  // Mock skills based on profession (in real app, these would come from API)
  const skills = mentor.profession 
    ? [mentor.profession, "Mentoring", "Problem Solving", "Communication"]
    : ["Mentoring", "Teaching", "Problem Solving"];


  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Cover Image */}
      <div className="relative h-56 md:h-72 lg:h-80 w-full overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-blue-600 via-purple-600 to-indigo-600" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557821552-17105176677c?w=1200&h=400&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-30" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-50 dark:from-slate-950 to-transparent" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Navigation */}
        <div className="pt-4 md:pt-5">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to mentors
          </Link>
        </div>

        {/* ================================
            HEADER SECTION
        ================================ */}
        <div className="relative -mt-24 md:-mt-28 pb-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Profile Image */}
            <div className="flex flex-col sm:flex-row items-start gap-5 sm:gap-6">
              <div className="relative">
                <div className="w-36 h-36 md:w-44 md:h-44 rounded-2xl overflow-hidden border-4 border-white dark:border-slate-900 shadow-2xl bg-white dark:bg-slate-800">
                  {mentor.profileImageUrl ? (
                    <img
                      src={mentor.profileImageUrl}
                      alt={fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white text-5xl font-bold">
                      {mentor.firstName.charAt(0)}
                      {mentor.lastName.charAt(0)}
                    </div>
                  )}
                </div>
                {mentor.isCertified && (
                  <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-2.5 rounded-full shadow-lg ring-4 ring-white dark:ring-slate-900">
                    <Award className="w-5 h-5" />
                  </div>
                )}
              </div>

              {/* Name, Title, Company, Profession */}
              <div className="flex-1 pt-2 sm:pt-10 min-w-0">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white">
                    {fullName}
                  </h1>
                  {mentor.isCertified && (
                    <Badge className="bg-green-500 hover:bg-green-600 text-white">
                      <Award className="w-3 h-3 mr-1" />
                      Certified Mentor
                    </Badge>
                  )}
                </div>

                {/* Title */}
                {mentor.title && (
                  <p className="text-lg md:text-xl text-slate-700 dark:text-slate-200 font-semibold mb-2">
                    {mentor.title}
                  </p>
                )}

                {/* Company & Profession */}
                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-400 mb-4">
                  {mentor.profession && (
                    <span className="flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4" />
                      {mentor.profession}
                    </span>
                  )}
                  {mentor.company && (
                    <span className="flex items-center gap-1.5">
                      <Building2 className="w-4 h-4" />
                      {mentor.company}
                    </span>
                  )}
                  {mentor.startYear && (
                    <Badge variant="outline" className="font-medium">
                      <Calendar className="w-3 h-3 mr-1" />
                      Since {mentor.startYear}
                    </Badge>
                  )}
                </div>

                {/* Rating & Stats Row */}
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  {mentor.averageRating !== undefined && mentor.averageRating > 0 && (
                    <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 px-3 py-1.5 rounded-full">
                      <Star className="w-4 h-4 fill-amber-400" />
                      <span className="font-bold">{mentor.averageRating.toFixed(1)}</span>
                      <span className="text-amber-600 dark:text-amber-500">
                        ({mentor.totalRatings} reviews)
                      </span>
                    </div>
                  )}
                  {mentor.totalEnrollments !== undefined && mentor.totalEnrollments > 0 && (
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                      <Users className="w-4 h-4" />
                      <span className="font-medium">{mentor.totalEnrollments} students</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Schedule Session CTA */}
            <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3 lg:ml-auto lg:pt-10">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 w-full sm:w-auto">
                <Calendar className="w-5 h-5 mr-2" />
                Schedule Session
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                <Share2 className="w-5 h-5 mr-2" />
                Share Profile
              </Button>
            </div>
          </div>
        </div>

        {/* ================================
            STATISTICS SECTION
        ================================ */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-500 flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl md:text-3xl font-bold text-blue-700 dark:text-blue-300">
                {mentor.totalEnrollments || 0}
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                Students Taught
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-purple-500 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl md:text-3xl font-bold text-purple-700 dark:text-purple-300">
                {mentor.startYear ? new Date().getFullYear() - mentor.startYear : 0}+
              </p>
              <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                Years Experience
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-500 flex items-center justify-center">
                <ThumbsUp className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl md:text-3xl font-bold text-green-700 dark:text-green-300">
                {positiveReviewPercent}%
              </p>
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                Positive Reviews
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-orange-500 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl md:text-3xl font-bold text-orange-700 dark:text-orange-300">
                {subjectCount}
              </p>
              <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                Subjects Taught
              </p>
            </CardContent>
          </Card>
        </div>

        {/* ================================
            ABOUT SECTION
        ================================ */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-blue-600" />
              About {mentor.firstName}
            </h2>
            
            {/* Bio */}
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
              {mentor.bio || `${fullName} is an experienced mentor dedicated to helping students achieve their learning goals. With expertise in ${mentor.profession || "their field"}, they bring practical knowledge and a passion for teaching to every session.`}
            </p>

            {/* Experience Highlights */}
            {(mentor.experienceYears || mentor.company || mentor.startYear) && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                  Experience Highlights
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {mentor.experienceYears && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                      <Briefcase className="w-5 h-5 text-blue-500" />
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        {mentor.experienceYears}+ years in {mentor.profession || "the industry"}
                      </span>
                    </div>
                  )}
                  {mentor.company && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                      <Building2 className="w-5 h-5 text-purple-500" />
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        Currently at {mentor.company}
                      </span>
                    </div>
                  )}
                  {mentor.startYear && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                      <Calendar className="w-5 h-5 text-green-500" />
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        Mentoring since {mentor.startYear}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Key Skills / Specializations */}
            <div>
              <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                Key Skills & Specializations
              </h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="px-3 py-1.5 text-sm bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
                  >
                    <Sparkles className="w-3 h-3 mr-1.5 text-blue-500" />
                    {skill}
                  </Badge>
                ))}
                {mentor.subjects?.slice(0, 3).map((subject) => (
                  <Badge
                    key={subject.id}
                    variant="secondary"
                    className="px-3 py-1.5 text-sm bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                  >
                    <BookOpen className="w-3 h-3 mr-1.5" />
                    {subject.subjectName || subject.name}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ================================
            SUBJECTS TAUGHT SECTION
        ================================ */}
        {mentor.subjects && mentor.subjects.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                Subjects Taught
              </h2>
              <Badge variant="outline">{mentor.subjects.length} subjects</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {mentor.subjects.map((subject) => (
                <Card key={subject.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                  {/* Subject Thumbnail */}
                  <div className="relative h-40 overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900">
                    {subject.imageUrl ? (
                      <img
                        src={subject.imageUrl}
                        alt={subject.subjectName || subject.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-16 h-16 text-blue-300 dark:text-blue-600" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <h3 className="absolute bottom-3 left-4 right-4 text-lg font-bold text-white">
                      {subject.subjectName || subject.name}
                    </h3>
                  </div>

                  <CardContent className="pt-4">
                    {/* Description */}
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4">
                      {subject.description || `Learn ${subject.subjectName || subject.name} with ${mentor.firstName} through personalized mentoring sessions.`}
                    </p>

                    {/* Enrollment Count */}
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-4">
                      <Users className="w-4 h-4" />
                      <span>{subject.subjectEnrollment } students enrolled</span>
                    </div>

                    {/* Book Button */}
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      <Calendar className="w-4 h-4 mr-2" />
                      Book This Subject
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ================================
            CONTACT & SESSIONS GRID
        ================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-12">
          {/* Left Column - Contact Info */}
          <div className="space-y-6">
            {/* Contact Info */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
                  Contact Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                    <Mail className="w-5 h-5 text-slate-400" />
                    <span className="text-sm">{mentor.email}</span>
                  </div>
                  {mentor.phoneNumber && (
                    <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                      <Phone className="w-5 h-5 text-slate-400" />
                      <span className="text-sm">{mentor.phoneNumber}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sessions */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Recent Sessions
                  </h3>
                  <Badge variant="outline">{sessions.length} total</Badge>
                </div>

                {sessions.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-500 dark:text-slate-400">
                      No sessions available yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sessions.slice(0, 5).map((session) => {
                      const statusConfig = getStatusConfig(session.sessionStatus);
                      const StatusIcon = statusConfig.icon;

                      return (
                        <div
                          key={session.id}
                          className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                              <h4 className="font-semibold text-slate-900 dark:text-white break-words">
                                {session.subject?.subjectName || session.subject?.name || "Session"}
                              </h4>
                              <Badge className={`${statusConfig.className} w-fit`}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {statusConfig.label}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                              <span className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4" />
                                {formatDate(session.sessionAt)}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Clock className="w-4 h-4" />
                                {formatTime(session.sessionAt)}
                                {session.durationMinutes && (
                                  <span>({session.durationMinutes} min)</span>
                                )}
                              </span>
                            </div>
                          </div>

                          {session.sessionStatus === "SCHEDULED" && session.meetingLink && (
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 shrink-0 w-full sm:w-auto">
                              <Video className="w-4 h-4 mr-1" />
                              Join
                            </Button>
                          )}
                        </div>
                      );
                    })}

                    {sessions.length > 5 && (
                      <>
                        <Separator />
                        <Button variant="ghost" className="w-full">
                          View all {sessions.length} sessions
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}