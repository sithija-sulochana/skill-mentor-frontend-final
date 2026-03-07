import { useCallback, useEffect, useRef, useState } from "react";
import { MentorCard } from "@/components/MentorCard";
import { getPublicMentors } from "@/lib/api";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@clerk/clerk-react";
import type { Mentor } from "@/types";
import {
  Search,
  GraduationCap,
  Award,
  ArrowRight,
  Sparkles,
  BookOpen,
  Video,
  Clock,
  CheckCircle2,
  Filter,
  X,
  RefreshCw,
  TrendingUp,
} from "lucide-react";

// Animation styles
const animationStyles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeInScale {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes slideInLeft {
    from {
      opacity: 0;
      transform: translateX(-30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0) rotate(0deg);
    }
    50% {
      transform: translateY(-20px) rotate(5deg);
    }
  }

  @keyframes pulse-glow {
    0%, 100% {
      box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
    }
    50% {
      box-shadow: 0 0 40px rgba(59, 130, 246, 0.8), 0 0 60px rgba(139, 92, 246, 0.4);
    }
  }

  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }

  .animate-fade-in-up {
    animation: fadeInUp 0.8s ease-out forwards;
    opacity: 0;
  }

  .animate-fade-in-scale {
    animation: fadeInScale 0.6s ease-out forwards;
    opacity: 0;
  }

  .animate-slide-in-left {
    animation: slideInLeft 0.8s ease-out forwards;
    opacity: 0;
  }

  .animate-slide-in-right {
    animation: slideInRight 0.8s ease-out forwards;
    opacity: 0;
  }

  .animate-float {
    animation: float 6s ease-in-out infinite;
  }

  .animate-pulse-glow {
    animation: pulse-glow 3s ease-in-out infinite;
  }

  .animate-shimmer {
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
    background-size: 200% 100%;
    animation: shimmer 2s infinite;
  }

  .delay-100 { animation-delay: 0.1s; }
  .delay-200 { animation-delay: 0.2s; }
  .delay-300 { animation-delay: 0.3s; }
  .delay-400 { animation-delay: 0.4s; }
  .delay-500 { animation-delay: 0.5s; }
  .delay-600 { animation-delay: 0.6s; }
  .delay-700 { animation-delay: 0.7s; }
  .delay-800 { animation-delay: 0.8s; }
`;

export default function HomePage() {
  const { isSignedIn } = useAuth();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);

  const loadMentors = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getPublicMentors();
      setMentors(data.content);
    } catch (err) {
      setMentors([]);
      setError(
        err instanceof Error ? err.message : "Unable to load mentors right now."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    void loadMentors();
  }, [loadMentors]);

  // Get unique subjects from all mentors
  const allSubjects = Array.from(
    new Set(
      mentors.flatMap((m) =>
        m.subjects?.map((s) => s.subjectName).filter(Boolean) || []
      )
    )
  );

  // Filter mentors based on search and subject
  const filteredMentors = mentors.filter((mentor) => {
    const matchesSearch =
      searchQuery === "" ||
      `${mentor.firstName} ${mentor.lastName}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      mentor.profession?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.subjects?.some((s) =>
        s.subjectName?.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesSubject =
      !selectedSubject ||
      mentor.subjects?.some((s) => s.subjectName === selectedSubject);

    return matchesSearch && matchesSubject;
  });

  // Calculate statistics
  const totalMentors = mentors.length;
  const totalSubjects = allSubjects.length;
  const certifiedMentors = mentors.filter((m) => m.isCertified).length;
  const totalEnrollments = mentors.reduce(
    (acc, m) => acc + (m.totalEnrollments || 0),
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Inject Animation Styles */}
      <style>{animationStyles}</style>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700" />

        {/* Pattern Overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,white_1px,transparent_1px)] bg-[size:24px_24px]" />
        </div>

        {/* Floating Elements - Animated */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float delay-300" style={{ animationDelay: "1.5s" }} />
        <div className="absolute top-40 right-20 w-32 h-32 bg-cyan-400/20 rounded-full blur-2xl animate-float" style={{ animationDelay: "0.8s" }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center">
            {/* Badge - Animated */}
            <div className="animate-fade-in-up inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm mb-8">
              <Sparkles className="w-4 h-4" />
              <span>Trusted by thousands of learners worldwide</span>
            </div>

            {/* Main Heading - Animated */}
            <h1 className="animate-fade-in-up delay-200 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight">
              Find Your Perfect
              <span className="block mt-2 bg-gradient-to-r from-yellow-200 via-pink-200 to-cyan-200 bg-clip-text text-transparent">
                SkillMentor
              </span>
            </h1>

            {/* Subheading - Animated */}
            <p className="animate-fade-in-up delay-300 text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto mb-10">
              Empower your career with personalized 1-on-1 mentorship from
              industry experts. Master AWS, ace interviews, and unlock your
              potential.
            </p>

            {/* CTA Buttons - Animated */}
            <div className="animate-fade-in-up delay-400 flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              {isSignedIn ? (
                <>
                  <Link to="/dashboard">
                    <Button
                      size="lg"
                      className="bg-white text-blue-600 hover:bg-blue-50 shadow-xl shadow-blue-900/20 text-lg px-8 py-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                    >
                      Go to Dashboard
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  {/* <Link to="/chess">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-white/30 text-black bg-white hover:bg-white/10 text-lg px-8 py-6 transition-all duration-300 hover:scale-105"
                    >
                      ♟️ Play Chess with mentors
                    </Button>
                  </Link> */}
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button
                      size="lg"
                      className="bg-white text-blue-600 hover:bg-blue-50 shadow-xl shadow-blue-900/20 text-lg px-8 py-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl animate-pulse-glow"
                    >
                      Get Started Free
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10 text-lg px-8 py-6 transition-all duration-300 hover:scale-105"
                    onClick={() =>
                      document
                        .getElementById("mentors")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                  >
                    Browse Mentors
                  </Button>
                  <Link to="/chess">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-white/30 text-white hover:bg-white/10 text-lg px-8 py-6 transition-all duration-300 hover:scale-105"
                    >
                      ♟️ Play Chess
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Stats Row - Staggered Animation */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              <div className="animate-fade-in-scale delay-500 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                <p className="text-3xl font-bold text-white">{totalMentors}+</p>
                <p className="text-blue-200 text-sm">Expert Mentors</p>
              </div>
              <div className="animate-fade-in-scale delay-600 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                <p className="text-3xl font-bold text-white">{totalSubjects}+</p>
                <p className="text-blue-200 text-sm">Subjects</p>
              </div>
              <div className="animate-fade-in-scale delay-700 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                <p className="text-3xl font-bold text-white">
                  {totalEnrollments}+
                </p>
                <p className="text-blue-200 text-sm">Students Taught</p>
              </div>
              <div className="animate-fade-in-scale delay-800 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                <p className="text-3xl font-bold text-white">
                  {certifiedMentors}
                </p>
                <p className="text-blue-200 text-sm">Certified Mentors</p>
              </div>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full"
          >
            <path
              d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              className="fill-slate-50 dark:fill-slate-950"
            />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="animate-slide-in-left text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Why Choose SkillMentor?
            </h2>
            <p className="animate-slide-in-right text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              We connect you with industry experts who are passionate about
              helping you succeed in your career journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="animate-fade-in-up delay-100 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-2 group">
              <CardContent className="pt-6 text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Video className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                  1-on-1 Sessions
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Personalized video calls with your mentor
                </p>
              </CardContent>
            </Card>

            <Card className="animate-fade-in-up delay-200 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-2 group">
              <CardContent className="pt-6 text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Award className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                  Certified Experts
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Learn from verified industry professionals
                </p>
              </CardContent>
            </Card>

            <Card className="animate-fade-in-up delay-300 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-2 group">
              <CardContent className="pt-6 text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Clock className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                  Flexible Scheduling
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Book sessions that fit your schedule
                </p>
              </CardContent>
            </Card>

            <Card className="animate-fade-in-up delay-400 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-2 group">
              <CardContent className="pt-6 text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                  Career Growth
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Accelerate your professional development
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Mentors Section */}
      <section id="mentors" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
                <GraduationCap className="w-8 h-8 text-blue-600" />
                Meet Our Mentors
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Connect with experienced professionals ready to guide your
                journey
              </p>
            </div>

            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search mentors, skills, companies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Subject Filter Tags */}
          {allSubjects.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Filter by subject:
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={selectedSubject === null ? "default" : "outline"}
                  className={`cursor-pointer transition-all ${
                    selectedSubject === null
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                  onClick={() => setSelectedSubject(null)}
                >
                  All Subjects
                </Badge>
                {allSubjects.map((subject) => (
                  <Badge
                    key={subject}
                    variant={selectedSubject === subject ? "default" : "outline"}
                    className={`cursor-pointer transition-all ${
                      selectedSubject === subject
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                    onClick={() => setSelectedSubject(subject)}
                  >
                    <BookOpen className="w-3 h-3 mr-1" />
                    {subject}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Results Count */}
          {!loading && !error && (
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Showing{" "}
                <span className="font-semibold text-slate-900 dark:text-white">
                  {filteredMentors.length}
                </span>{" "}
                {filteredMentors.length === 1 ? "mentor" : "mentors"}
                {(searchQuery || selectedSubject) && (
                  <span>
                    {" "}
                    for{" "}
                    {searchQuery && (
                      <span className="text-blue-600">"{searchQuery}"</span>
                    )}
                    {searchQuery && selectedSubject && " in "}
                    {selectedSubject && (
                      <span className="text-blue-600">{selectedSubject}</span>
                    )}
                  </span>
                )}
              </p>
              {(searchQuery || selectedSubject) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedSubject(null);
                  }}
                  className="text-slate-600 hover:text-slate-900"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear filters
                </Button>
              )}
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="p-6 animate-pulse">
                    <div className="flex justify-between mb-4">
                      <div className="space-y-3 flex-1">
                        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
                      </div>
                      <div className="w-20 h-20 bg-slate-200 dark:bg-slate-800 rounded" />
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded" />
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-5/6" />
                    </div>
                    <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded mb-4" />
                    <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded" />
                  </div>
                </Card>
              ))}
            </div>
          ) : error ? (
            /* Error State */
            <Card className="max-w-md mx-auto">
              <CardContent className="pt-12 pb-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <X className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  Unable to Load Mentors
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  {error}
                </p>
                <Button onClick={() => void loadMentors()} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </CardContent>
            </Card>
          ) : filteredMentors.length === 0 ? (
            /* Empty State */
            <Card className="max-w-md mx-auto">
              <CardContent className="pt-12 pb-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <Search className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  No Mentors Found
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  {searchQuery || selectedSubject
                    ? "Try adjusting your search or filters"
                    : "No mentors are available at the moment"}
                </p>
                {(searchQuery || selectedSubject) && (
                  <Button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedSubject(null);
                    }}
                    variant="outline"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            /* Mentor Grid */
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredMentors.map((mentor) => (
                <MentorCard key={mentor.id} mentor={mentor} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Start Your Learning Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of learners who are advancing their careers with
            SkillMentor
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isSignedIn ? (
              <Link to="/dashboard">
                <Button
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-blue-50 shadow-xl text-lg px-8 py-6"
                >
                  View Your Dashboard
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-blue-50 shadow-xl text-lg px-8 py-6"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Get Started for Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            )}
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-blue-100">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>Free to join</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>Verified mentors</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>Flexible scheduling</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
