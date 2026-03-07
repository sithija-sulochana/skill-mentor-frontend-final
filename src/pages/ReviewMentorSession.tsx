import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Star,
  Send,
  MessageSquare,
  CheckCircle2,
  Sparkles,
  Calendar,
  Clock,
  Loader2,
  AlertCircle,
  BookOpen,
} from "lucide-react";
import { getMyEnrollments } from "@/lib/api";
import type { Enrollment } from "@/types";

interface ReviewFormData {
  studentId?: number;
  mentorId: string;
  sessionId: string;
  rating: number;
  review: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";

export default function ReviewMentorSession() {
  const { getToken } = useAuth();
  const [sessions, setSessions] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hoveredRating, setHoveredRating] = useState(0);

  const [formData, setFormData] = useState<ReviewFormData>({
    studentId: undefined,
    mentorId: "",
    sessionId: "",
    rating: 0,
    review: "",
  });

  // Get unique mentors from completed sessions
  const completedSessions = sessions.filter(
    (s) => s.sessionStatus === "COMPLETED" || s.sessionStatus === "completed"
  );

  const uniqueMentors = Array.from(
    new Map(
      completedSessions.map((s) => [
        s.mentorName,
        { name: s.mentorName, imageUrl: s.mentorProfileImageUrl },
      ])
    ).values()
  );

  // Get sessions for selected mentor
  const mentorSessions = completedSessions.filter(
    (s) => s.mentorName === formData.mentorId
  );

  useEffect(() => {
    async function fetchSessions() {
      try {
        const token = await getToken({ template: "skill-mentor" });
        if (!token) {
          setError("Please sign in to submit reviews");
          setLoading(false);
          return;
        }
        const data = await getMyEnrollments(token);
        setSessions(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load sessions");
      } finally {
        setLoading(false);
      }
    }
    fetchSessions();
  }, [getToken]);

  const handleMentorChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      mentorId: value,
      sessionId: "", // Reset session when mentor changes
    }));
  };

  const handleSessionChange = (value: string) => {
    setFormData((prev) => ({ ...prev, sessionId: value }));
  };

  const handleRatingChange = (rating: number) => {
    setFormData((prev) => ({ ...prev, rating }));
  };

  const handleReviewChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, review: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.mentorId || !formData.sessionId || !formData.rating || !formData.review.trim()) {
      setError("Please fill in all fields");
      return;
    }

    setSubmitting(true);

    try {
      const token = await getToken({ template: "skill-mentor" });
      if (!token) throw new Error("Authentication required");

      // Get the selected session to extract the session ID
      const selectedSession = completedSessions.find(
        (s) => s.id.toString() === formData.sessionId
      );

      if (!selectedSession) {
        throw new Error("Session not found");
      }

      // Fetch full session details to get mentor ID and student ID
      const sessionRes = await fetch(
        `${API_BASE_URL}/api/v1/sessions/${selectedSession.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!sessionRes.ok) {
        throw new Error("Failed to fetch session details");
      }

      const fullSession = await sessionRes.json();
      console.log("Fetched full session details:", fullSession);

      const reviewDTO = {
        studentId: fullSession.student?.id,
        mentorId: fullSession.mentor?.id,
        sessionId: fullSession.id,
        rating: formData.rating,
        review: formData.review.trim(),
      };


      
      console.log("Full Session Data:", fullSession);

      console.log("Submitting review:", reviewDTO);

      const res = await fetch(`${API_BASE_URL}/api/v1/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(reviewDTO),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to submit review");
      }

      setSubmitted(true);
      setFormData({ mentorId: "", sessionId: "", rating: 0, review: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getRatingLabel = (rating: number) => {
    const labels = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];
    return labels[rating] || "";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Loading your sessions...</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-linear-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 py-12 px-4">
        <div className="max-w-lg mx-auto">
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="h-2 bg-linear-to-r from-green-500 to-emerald-500" />
            <CardContent className="pt-12 pb-8 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Review Submitted!
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-8">
                Thank you for your feedback. Your review helps mentors improve and
                helps other students make informed decisions.
              </p>
              <Button
                onClick={() => setSubmitted(false)}
                className="bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Submit Another Review
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-blue-600 via-purple-600 to-indigo-700" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,white_1px,transparent_1px)] bg-size-[24px_24px]" />
        </div>
        <div className="absolute top-10 left-10 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <Badge className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm px-4 py-1.5 mb-4">
              <Sparkles className="w-4 h-4 mr-2" />
              Share Your Experience
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Review Your Mentor Session
            </h1>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto">
              Your feedback helps mentors improve and helps other students find the
              perfect mentor for their learning journey
            </p>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full">
            <path
              d="M0 60L60 52.5C120 45 240 30 360 22.5C480 15 600 15 720 18.75C840 22.5 960 30 1080 33.75C1200 37.5 1320 37.5 1380 37.5L1440 37.5V60H1380C1320 60 1200 60 1080 60C960 60 840 60 720 60C600 60 480 60 360 60C240 60 120 60 60 60H0Z"
              className="fill-slate-50 dark:fill-slate-950"
            />
          </svg>
        </div>
      </section>

      {/* Review Form */}
      <section className="py-12 px-4">
        <div className="max-w-2xl mx-auto">
          {completedSessions.length === 0 ? (
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardContent className="pt-12 pb-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  No Completed Sessions
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  You haven't completed any sessions yet. Once you complete a session
                  with a mentor, you'll be able to leave a review.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="h-1.5 bg-linear-to-r from-blue-500 via-purple-500 to-indigo-500" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  Write Your Review
                </CardTitle>
                <CardDescription>
                  Select a mentor and session, then share your thoughts
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Error Alert */}
                  {error && (
                    <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                      <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                    </div>
                  )}

                  {/* Mentor Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="mentor" className="text-slate-900 dark:text-white">
                      Select Mentor
                    </Label>
                    <Select value={formData.mentorId} onValueChange={handleMentorChange}>
                      <SelectTrigger className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                        <SelectValue placeholder="Choose a mentor to review" />
                      </SelectTrigger>
                      <SelectContent>
                        {uniqueMentors.map((mentor) => (
                          <SelectItem key={mentor.name} value={mentor.name}>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={mentor.imageUrl} />
                                <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                                  {mentor.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <span>{mentor.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Session Selection */}
                  {formData.mentorId && (
                    <div className="space-y-2">
                      <Label htmlFor="session" className="text-slate-900 dark:text-white">
                        Select Session
                      </Label>
                      <Select value={formData.sessionId} onValueChange={handleSessionChange}>
                        <SelectTrigger className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                          <SelectValue placeholder="Choose a completed session" />
                        </SelectTrigger>
                        <SelectContent>
                          {mentorSessions.map((session) => (
                            <SelectItem key={session.id} value={session.id.toString()}>
                              <div className="flex items-center gap-3">
                                <div className="flex flex-col">
                                  <span className="font-medium">{session.subjectName}</span>
                                  <span className="text-xs text-slate-500">
                                    {formatDate(session.sessionAt)} at {formatTime(session.sessionAt)}
                                  </span>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* Selected Session Preview */}
                      {formData.sessionId && (
                        <div className="mt-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                          {(() => {
                            const selectedSession = mentorSessions.find(
                              (s) => s.id.toString() === formData.sessionId
                            );
                            if (!selectedSession) return null;
                            return (
                              <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-slate-900 dark:text-white">
                                    {selectedSession.subjectName}
                                  </span>
                                  <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 dark:bg-green-900/20">
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Completed
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {formatDate(selectedSession.sessionAt)}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {selectedSession.durationMinutes} min
                                  </span>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Rating */}
                  <div className="space-y-3">
                    <Label className="text-slate-900 dark:text-white">
                      Rating
                    </Label>
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => handleRatingChange(star)}
                            onMouseEnter={() => setHoveredRating(star)}
                            onMouseLeave={() => setHoveredRating(0)}
                            className="p-1 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
                          >
                            <Star
                              className={`w-10 h-10 transition-colors ${
                                star <= (hoveredRating || formData.rating)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-slate-300 dark:text-slate-600"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                      {(hoveredRating || formData.rating) > 0 && (
                        <Badge
                          variant="outline"
                          className={`transition-all ${
                            (hoveredRating || formData.rating) >= 4
                              ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800"
                              : (hoveredRating || formData.rating) >= 3
                              ? "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800"
                              : "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800"
                          }`}
                        >
                          {getRatingLabel(hoveredRating || formData.rating)}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Review Text */}
                  <div className="space-y-2">
                    <Label htmlFor="review" className="text-slate-900 dark:text-white">
                      Your Review
                    </Label>
                    <textarea
                      id="review"
                      value={formData.review}
                      onChange={handleReviewChange}
                      placeholder="Share your experience with this mentor. What did you learn? How was the teaching style? Would you recommend them?"
                      rows={5}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {formData.review.length}/500 characters
                    </p>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={submitting || !formData.mentorId || !formData.sessionId || !formData.rating || !formData.review.trim()}
                    className="w-full bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-6 text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Submit Review
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Tips Card */}
          <Card className="mt-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Tips for a Great Review
              </h4>
              <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>Be specific about what you learned and how the mentor helped</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>Mention the mentor's teaching style and communication</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>Share if your goals or expectations were met</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>Keep it constructive and helpful for future students</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
