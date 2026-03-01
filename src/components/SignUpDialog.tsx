"use client";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useNavigate } from "react-router";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Users,
  Star,
  Shield,
  GraduationCap,
} from "lucide-react";
import AWSCertified1Img from "@/assets/aws-certified-1.webp";
import AWSCertified2Img from "@/assets/aws-certified-2.webp";
import AWSCertified3Img from "@/assets/aws-certified-3.webp";
import MicrosoftCertified1Img from "@/assets/microsoft-certified-1.webp";
import MicrosoftCertified2Img from "@/assets/microsoft-certified-2.webp";
import MicrosoftCertified3Img from "@/assets/microsoft-certified-3.webp";

interface SignupDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SignupDialog({ isOpen, onClose }: SignupDialogProps) {
  const navigate = useNavigate();

  const handleSignup = () => {
    onClose();
    navigate("/login");
  };

  const certificationImages = [
    AWSCertified1Img,
    AWSCertified2Img,
    AWSCertified3Img,
    MicrosoftCertified3Img,
    MicrosoftCertified2Img,
    MicrosoftCertified1Img,
  ];

  const benefits = [
    { icon: Users, text: "Access 500+ expert mentors" },
    { icon: Star, text: "Personalized 1-on-1 sessions" },
    { icon: Shield, text: "Verified & certified tutors" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="overflow-hidden p-0 border-none rounded-3xl max-w-[480px] bg-white dark:bg-slate-900 shadow-2xl">
        <DialogTitle className="sr-only">Sign up to SkillMentor</DialogTitle>
        <DialogDescription className="sr-only">
          Sign up dialog to access SkillMentor's tutor booking features
        </DialogDescription>

        {/* Header with Gradient Background */}
        <div className="relative bg-linear-to-br from-blue-600 via-purple-600 to-indigo-700 p-6 pb-16">
          {/* Pattern Overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,white_1px,transparent_1px)] bg-size-[20px_20px]" />
          </div>

          {/* Floating decorative elements */}
          <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute bottom-8 left-4 w-16 h-16 bg-purple-400/20 rounded-full blur-xl" />

          {/* Badge */}
          <div className="relative flex justify-center mb-4">
            <Badge className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm px-3 py-1">
              <Sparkles className="w-3 h-3 mr-1.5" />
              Join 10,000+ learners
            </Badge>
          </div>

          {/* Title */}
          <h2 className="relative text-2xl sm:text-3xl font-bold text-white text-center leading-tight">
            Unlock Your
            <span className="block bg-linear-to-r from-yellow-200 via-pink-200 to-cyan-200 bg-clip-text text-transparent">
              Learning Potential
            </span>
          </h2>
        </div>

        {/* Certification Images - Overlapping the header */}
        <div className="relative -mt-10 px-6">
          <div className="grid grid-cols-6 gap-2">
            {certificationImages.map((src, i) => (
              <div
                key={i}
                className="aspect-square rounded-xl overflow-hidden border-2 border-white dark:border-slate-800 shadow-lg transform hover:scale-105 transition-transform duration-200"
              >
                <img
                  src={src}
                  alt={`Certification ${i + 1}`}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Content Section */}
        <div className="px-6 py-6 space-y-5">
          {/* Description */}
          <p className="text-center text-slate-600 dark:text-slate-400">
            Sign up to discover expert mentors and start your journey to success
          </p>

          {/* Benefits List */}
          <div className="space-y-3">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50"
                >
                  <div className="w-10 h-10 rounded-lg bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {benefit.text}
                  </span>
                  <CheckCircle2 className="w-5 h-5 text-green-500 ml-auto" />
                </div>
              );
            })}
          </div>

          {/* CTA Button */}
          <Button
            onClick={handleSignup}
            size="lg"
            className="w-full bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-6 rounded-xl shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:shadow-blue-500/30"
          >
            <GraduationCap className="w-5 h-5 mr-2" />
            Get Started Free
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          {/* Secondary Text */}
          <p className="text-center text-xs text-slate-500 dark:text-slate-400">
            No credit card required • Free to join • Cancel anytime
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
