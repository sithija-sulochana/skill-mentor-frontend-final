import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Target,
  Award,
  Heart,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Globe,
  Zap,
  BookOpen,
  Video,
  Shield,
  Star,
  GraduationCap,
  TrendingUp,
  Lightbulb,
  Handshake,
} from "lucide-react";

export default function AboutUs() {
  const stats = [
    { value: "10,000+", label: "Active Learners", icon: Users },
    { value: "500+", label: "Expert Mentors", icon: GraduationCap },
    { value: "50,000+", label: "Sessions Completed", icon: Video },
    { value: "98%", label: "Satisfaction Rate", icon: Star },
  ];

  const values = [
    {
      icon: Target,
      title: "Mission-Driven",
      description:
        "We're committed to making quality education accessible to everyone, breaking down barriers between learners and industry experts.",
    },
    {
      icon: Heart,
      title: "Student-Centric",
      description:
        "Every decision we make puts learners first. Your success is our success, and we're dedicated to your growth.",
    },
    {
      icon: Award,
      title: "Excellence",
      description:
        "We maintain the highest standards in mentor verification, platform quality, and learning experience.",
    },
    {
      icon: Lightbulb,
      title: "Innovation",
      description:
        "We continuously evolve our platform with cutting-edge technology to enhance the learning experience.",
    },
    {
      icon: Handshake,
      title: "Community",
      description:
        "We foster a supportive community where mentors and learners grow together through collaboration.",
    },
    {
      icon: Globe,
      title: "Accessibility",
      description:
        "Learning has no boundaries. We connect learners worldwide with mentors from diverse backgrounds.",
    },
  ];

  const teamMembers = [
    {
      name: "Sarah Johnson",
      role: "Founder & CEO",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
      bio: "Former Google engineer passionate about education technology",
    },
    {
      name: "Michael Chen",
      role: "CTO",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
      bio: "15+ years in EdTech, previously led engineering at Coursera",
    },
    {
      name: "Emily Rodriguez",
      role: "Head of Mentors",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
      bio: "EdD in Learning Sciences, dedicated to mentor quality",
    },
    {
      name: "David Kim",
      role: "Head of Product",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
      bio: "Product leader with experience at top tech companies",
    },
  ];

  const milestones = [
    { year: "2020", title: "Founded", description: "SkillMentor was born with a vision to democratize mentorship" },
    { year: "2021", title: "1,000 Mentors", description: "Reached our first major milestone of verified mentors" },
    { year: "2022", title: "Global Expansion", description: "Expanded to 50+ countries with localized support" },
    { year: "2023", title: "Series A", description: "Raised $10M to accelerate growth and innovation" },
    { year: "2024", title: "AI Integration", description: "Launched AI-powered mentor matching system" },
    { year: "2025", title: "10K Mentors", description: "Grew to 10,000+ mentors across all industries" },
  ];

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-linear-to-br from-blue-600 via-purple-600 to-indigo-700" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,white_1px,transparent_1px)] bg-size-[24px_24px]" />
        </div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <Badge className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm px-4 py-1.5 mb-6">
              <Sparkles className="w-4 h-4 mr-2" />
              About SkillMentor
            </Badge>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
              Empowering Learners
              <span className="block mt-2 bg-linear-to-r from-yellow-200 via-pink-200 to-cyan-200 bg-clip-text text-transparent">
                One Session at a Time
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-blue-100 max-w-3xl mx-auto mb-10">
              We believe everyone deserves access to personalized mentorship. Our platform
              connects ambitious learners with industry experts who are passionate about
              sharing their knowledge and helping others succeed.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/">
                <Button
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-blue-50 shadow-xl text-lg px-8 py-6"
                >
                  Browse Mentors
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 text-lg px-8 py-6"
                >
                  Become a Mentor
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" className="w-full">
            <path
              d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              className="fill-slate-50 dark:fill-slate-950"
            />
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card
                  key={index}
                  className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow"
                >
                  <CardContent className="pt-6 text-center">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <p className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-1">
                      {stat.value}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {stat.label}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="outline" className="mb-4">
                <BookOpen className="w-3 h-3 mr-1" />
                Our Story
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-6">
                From a Simple Idea to a{" "}
                <span className="text-blue-600">Global Platform</span>
              </h2>
              <div className="space-y-4 text-slate-600 dark:text-slate-400">
                <p>
                  SkillMentor was founded in 2020 with a simple but powerful idea: everyone
                  should have access to quality mentorship, regardless of their location,
                  background, or financial situation.
                </p>
                <p>
                  Our founders experienced firsthand how transformative mentorship can be.
                  From career pivots to skill mastery, having the right guidance at the
                  right time can change everything. But access to great mentors was often
                  limited to those with the right connections or resources.
                </p>
                <p>
                  Today, SkillMentor connects thousands of learners with expert mentors
                  across technology, business, design, and more. We've facilitated over
                  50,000 mentoring sessions and helped countless individuals achieve their
                  professional goals.
                </p>
              </div>

              <div className="mt-8 flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Verified mentors</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Secure platform</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>24/7 support</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-linear-to-br from-blue-500/20 to-purple-500/20 rounded-3xl blur-2xl" />
              <div className="relative grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="h-48 rounded-2xl bg-linear-to-br from-blue-500 to-blue-600 p-6 flex flex-col justify-end">
                    <Zap className="w-8 h-8 text-white mb-2" />
                    <p className="text-white font-semibold">Fast Matching</p>
                    <p className="text-blue-100 text-sm">Find your mentor in minutes</p>
                  </div>
                  <div className="h-32 rounded-2xl bg-slate-100 dark:bg-slate-800 p-6 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">150+</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Skills Covered</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="h-32 rounded-2xl bg-slate-100 dark:bg-slate-800 p-6 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">50+</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Countries</p>
                    </div>
                  </div>
                  <div className="h-48 rounded-2xl bg-linear-to-br from-purple-500 to-purple-600 p-6 flex flex-col justify-end">
                    <TrendingUp className="w-8 h-8 text-white mb-2" />
                    <p className="text-white font-semibold">Career Growth</p>
                    <p className="text-purple-100 text-sm">Accelerate your success</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              <Heart className="w-3 h-3 mr-1" />
              Our Values
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              What We Stand For
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Our core values guide everything we do, from how we build our platform to
              how we support our community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card
                  key={index}
                  className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all hover:-translate-y-1"
                >
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 rounded-xl bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                      {value.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              <TrendingUp className="w-3 h-3 mr-1" />
              Our Journey
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Milestones We're Proud Of
            </h2>
          </div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-slate-200 dark:bg-slate-700 hidden md:block" />

            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div
                  key={index}
                  className={`relative flex flex-col md:flex-row items-center gap-4 ${
                    index % 2 === 0 ? "md:flex-row-reverse" : ""
                  }`}
                >
                  <div className="flex-1 w-full md:w-auto">
                    <Card
                      className={`bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 ${
                        index % 2 === 0 ? "md:mr-8" : "md:ml-8"
                      }`}
                    >
                      <CardContent className="pt-6">
                        <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 mb-2">
                          {milestone.year}
                        </Badge>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                          {milestone.title}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {milestone.description}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Timeline Dot */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full bg-blue-600 border-4 border-white dark:border-slate-900 hidden md:block" />

                  <div className="flex-1 hidden md:block" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              <Users className="w-3 h-3 mr-1" />
              Our Team
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Meet the People Behind SkillMentor
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              A passionate team dedicated to transforming how people learn and grow
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, index) => (
              <Card
                key={index}
                className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 overflow-hidden group hover:shadow-lg transition-all"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                </div>
                <CardContent className="pt-4 pb-6 text-center -mt-12 relative">
                  <div className="w-20 h-20 mx-auto rounded-full border-4 border-white dark:border-slate-900 overflow-hidden mb-3 shadow-lg">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {member.name}
                  </h3>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-2">
                    {member.role}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {member.bio}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-linear-to-br from-blue-600 via-purple-600 to-indigo-700 border-none overflow-hidden">
            <CardContent className="pt-12 pb-12 text-center relative">
              {/* Decorative Elements */}
              <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl" />
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-purple-400/20 rounded-full translate-x-1/2 translate-y-1/2 blur-2xl" />

              <div className="relative">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Shield className="w-8 h-8 text-white" />
                </div>

                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                  Ready to Start Your Journey?
                </h2>
                <p className="text-lg text-blue-100 mb-8 max-w-xl mx-auto">
                  Join thousands of learners who are already achieving their goals with
                  personalized mentorship
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link to="/">
                    <Button
                      size="lg"
                      className="bg-white text-blue-600 hover:bg-blue-50 shadow-xl text-lg px-8 py-6"
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      Find a Mentor
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-white/30 text-white hover:bg-white/10 text-lg px-8 py-6"
                    >
                      Join as Mentor
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
