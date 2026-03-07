import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Calendar,
  ShieldCheck,
  ThumbsUp,
  Users,
  BookOpen,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import type { Mentor } from "@/types";
import { SchedulingModal } from "@/components/SchedulingModel";
import { SignupDialog } from "@/components/SignUpDialog";
import { cn } from "@/lib/utils";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router";

interface MentorCardProps {
  mentor: Mentor;
}

export function MentorCard({ mentor }: MentorCardProps) {
  const navigate = useNavigate();
  const [isSchedulingModalOpen, setIsSchedulingModalOpen] = useState(false);
  const [isSignupDialogOpen, setIsSignupDialogOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { isSignedIn } = useAuth();

  const subjects = Array.isArray(mentor.subjects) ? mentor.subjects : [];
  const mentorName = `${mentor.firstName} ${mentor.lastName}`;
  const hasSubjects = subjects.length > 0;
  const courseTitle = subjects[0]?.subjectName ?? "No Subject";
  const courseImage = subjects[0]?.courseImageUrl ?? "";

  console.log("MentorCard Rendered:", { mentor, subjects, courseTitle, courseImage });
  const bio = mentor.bio ?? "";
  const bioTooLong = bio.length > 120;

  const handleSchedule = () => {
    if (!isSignedIn) {
      setIsSignupDialogOpen(true);
      return;
    }
    setIsSchedulingModalOpen(true);
  };

  const handleViewProfile = () => {
    navigate(`/mentors/${mentor.id}`);
  };

  return (
    <>
      <Card
        className="group relative overflow-hidden border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Top Gradient Banner */}
        <div className="relative h-28 bg-linear-to-br from-blue-500 via-purple-500 to-indigo-600 overflow-hidden">
          {/* Pattern Overlay */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,white_1px,transparent_1px)] bg-size-[16px_16px]" />
          </div>

          {/* Course Image / Icon */}
          <div className="absolute top-3 right-3">
            {courseImage ? (
              <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-white/30 shadow-lg bg-white">
                <img
                  src={courseImage}
                  alt={courseTitle}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
            )}
          </div>

          {/* Certified Badge */}
          {mentor.isCertified && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-green-500 hover:bg-green-600 text-white shadow-lg">
                <ShieldCheck className="w-3 h-3 mr-1" />
                Certified
              </Badge>
            </div>
          )}

          {/* Mentor Avatar */}
          <div className="absolute -bottom-10 left-4 relative mt-1.5 z-10">
            <div
              className="w-20 h-20 rounded-2xl border-4 border-white dark:border-slate-800 shadow-xl overflow-hidden bg-white dark:bg-slate-800 cursor-pointer transform transition-transform hover:scale-105"
              onClick={handleViewProfile}
            >
              {mentor.profileImageUrl ? (
                <img
                  src={mentor.profileImageUrl}
                  alt={mentorName}
                  className="w-full h-full object-cover object-top rounded-2xl"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-blue-500 to-purple-600 text-white text-2xl font-bold">
                  {mentor.firstName.charAt(0)}
                  {mentor.lastName.charAt(0)}
                </div>
              )}
            </div>
          </div>
        </div>

        <CardContent className="pt-14 pb-5">
          {/* Subject Title */}
          <div className="mb-3">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
              {courseTitle}
            </h3>
          </div>

          {/* Mentor Info */}
          <div className="space-y-2 mb-4">
            {/* Mentor Name */}
            <div className="flex items-center gap-2">
              <span
                className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                onClick={handleViewProfile}
              >
                {mentorName}
              </span>
              {mentor.positiveReviews > 0 && (
                <div className="flex items-center gap-1 text-amber-500">
                  <ThumbsUp className="w-3 h-3 fill-amber-400" />
                  <span className="text-xs font-medium">
                    {mentor.positiveReviews}%
                  </span>
                </div>
              )}
            </div>

            {/* Company & Experience */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
              {mentor.company && (
                <span className="flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  {mentor.company}
                </span>
              )}
              {mentor.startYear && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Since {mentor.startYear}
                </span>
              )}
            </div>
          </div>

          {/* Bio */}
          {bio && (
            <div className="mb-4">
              <p
                className={cn(
                  "text-sm text-slate-600 dark:text-slate-400 leading-relaxed transition-all duration-300",
                  !isExpanded && bioTooLong ? "line-clamp-2" : ""
                )}
              >
                {bio}
              </p>
              {bioTooLong && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-blue-600 dark:text-blue-400 text-xs font-medium mt-1 hover:underline"
                >
                  {isExpanded ? "Show less" : "Read more"}
                </button>
              )}
            </div>
          )}

          {/* Stats Row */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
              <Users className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">
                {mentor.totalEnrollments || 0} students
              </span>
            </div>
            {subjects.length > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                <BookOpen className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">
                  {subjects.length} {subjects.length === 1 ? "subject" : "subjects"}
                </span>
              </div>
            )}
          </div>

          {/* Subjects Tags */}
          {subjects.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-5">
              {subjects.slice(0, 3).map((subject) => (
                <Badge
                  key={subject.id}
                  variant="secondary"
                  className="text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  {subject.subjectName}
                </Badge>
              ))}
              {subjects.length > 3 && (
                <Badge
                  variant="outline"
                  className="text-xs"
                >
                  +{subjects.length - 3} more
                </Badge>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleSchedule}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 transition-all"
              disabled={!hasSubjects}
            >
              {hasSubjects ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Book Session
                </>
              ) : (
                "No Courses"
              )}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleViewProfile}
              className="shrink-0 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>

        {/* Hover Glow Effect */}
        <div
          className={cn(
            "absolute inset-0 pointer-events-none transition-opacity duration-300",
            isHovered ? "opacity-100" : "opacity-0"
          )}
        >
          <div className="absolute inset-x-0 -bottom-px h-px bg-linear-to-r from-transparent via-blue-500 to-transparent" />
        </div>
      </Card>

      <SignupDialog
        isOpen={isSignupDialogOpen}
        onClose={() => setIsSignupDialogOpen(false)}
      />

      <SchedulingModal
        isOpen={isSchedulingModalOpen}
        onClose={() => setIsSchedulingModalOpen(false)}
        mentor={mentor}
      />
    </>
  );
}
