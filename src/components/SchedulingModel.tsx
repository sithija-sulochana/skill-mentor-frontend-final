"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useUser } from "@clerk/clerk-react";
import { Calendar } from "./ui/calendar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  AlertCircle,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  Loader2,
  User,
  BookOpen,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router";
import type { Mentor, Subject } from "@/types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";

interface SchedulingModalProps {
  isOpen: boolean;
  onClose: () => void;
  mentor: Mentor;
}

// Generate time slots from 9 AM to 5 PM
const generateTimeSlots = () => {
  const slots: string[] = [];
  for (let hour = 9; hour <= 17; hour++) {
    slots.push(`${hour.toString().padStart(2, "0")}:00`);
    if (hour < 17) {
      slots.push(`${hour.toString().padStart(2, "0")}:30`);
    }
  }
  return slots;
};

const TIME_SLOTS = generateTimeSlots();

const DURATION_OPTIONS = [
  { value: 30, label: "30 minutes" },
  { value: 45, label: "45 minutes" },
  { value: 60, label: "1 hour" },
  { value: 90, label: "1.5 hours" },
  { value: 120, label: "2 hours" },
];

interface BookedSession {
  sessionAt: string;
  durationMinutes: number;
}

export function SchedulingModal({
  isOpen,
  onClose,
  mentor,

}: SchedulingModalProps) {
  const { isSignedIn } = useUser();
  const navigate = useNavigate();

  // Form state
  const [date, setDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>();
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [duration, setDuration] = useState<number>(60);

  // Loading & error state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Ref to prevent double submissions (synchronous check)
  const isSubmittingRef = useRef(false);

  // Booked sessions for conflict checking
  const [bookedSessions, setBookedSessions] = useState<BookedSession[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const mentorName = `${mentor.firstName} ${mentor.lastName}`;

  // Set default subject when modal opens
  useEffect(() => {
    if (isOpen && mentor.subjects?.length > 0 && !selectedSubject) {
      setSelectedSubject(mentor.subjects[0]);
    }
  }, [isOpen, mentor.subjects, selectedSubject]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setDate(undefined);
      setSelectedTime(undefined);
      setSelectedSubject(null);
      setDuration(60);
      setError(null);
      setSuccess(false);
      setBookedSessions([]);
      setLoading(false);
      isSubmittingRef.current = false;
    }
  }, [isOpen]);

  // Fetch mentor's booked sessions when date changes
  useEffect(() => {
    const fetchBookedSessions = async () => {
      if (!date || !mentor.id) return;

      try {
        setLoadingSlots(true);
        // Fetch sessions for this mentor to check availability
        const res = await fetch(
          `${API_BASE_URL}/api/v1/sessions/mentor/${mentor.id}`
        );

        if (res.ok) {
          const sessions = await res.json();
          // Filter sessions for the selected date
          const selectedDateStr = date.toISOString().split("T")[0];
          const dayBookings = sessions.filter((s: { sessionAt: string }) => {
            const sessionDate = new Date(s.sessionAt)
              .toISOString()
              .split("T")[0];
            return sessionDate === selectedDateStr;
          });
          setBookedSessions(dayBookings);
        }
      } catch (err) {
        console.error("Failed to fetch booked sessions:", err);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchBookedSessions();
  }, [date, mentor.id]);

  // Check if a time slot conflicts with existing bookings
  const isSlotBooked = (time: string): boolean => {
    if (!date || bookedSessions.length === 0) return false;

    const [hours, minutes] = time.split(":").map(Number);
    const slotStart = new Date(date);
    slotStart.setHours(hours, minutes, 0, 0);
    const slotEnd = new Date(slotStart.getTime() + duration * 60000);

    return bookedSessions.some((session) => {
      const sessionStart = new Date(session.sessionAt);
      const sessionEnd = new Date(
        sessionStart.getTime() + session.durationMinutes * 60000
      );

      // Check for overlap
      return slotStart < sessionEnd && slotEnd > sessionStart;
    });
  };

  // Get available slots for selected date
  const availableSlots = useMemo(() => {
    if (!date) return TIME_SLOTS.map(time => ({ time, status: "available" as const }));

    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    return TIME_SLOTS.map((slot) => {
      const [hours, minutes] = slot.split(":").map(Number);

      // If today, filter out past times
      if (isToday) {
        const slotTime = new Date(date);
        slotTime.setHours(hours, minutes, 0, 0);
        if (slotTime <= now) {
          return { time: slot, status: "past" as const };
        }
      }

      // Check if booked
      if (isSlotBooked(slot)) {
        return { time: slot, status: "booked" as const };
      }

      return { time: slot, status: "available" as const };
    });
  }, [date, bookedSessions, duration]);

  // Handle scheduling
  const handleSchedule = async () => {
    // Synchronous check using ref to prevent double submissions
    if (isSubmittingRef.current || loading) return;
    isSubmittingRef.current = true;
    setLoading(true);

    if (!date || !selectedTime || !selectedSubject) {
      setError("Please select a date, time, and subject");
      setLoading(false);
      isSubmittingRef.current = false;
      return;
    }

    if (!isSignedIn) {
      setError("Please sign in to schedule a session");
      setLoading(false);
      isSubmittingRef.current = false;
      return;
    }

    // Build session datetime
    const sessionDateTime = new Date(date);
    const [hours, minutes] = selectedTime.split(":");
    sessionDateTime.setHours(Number.parseInt(hours), Number.parseInt(minutes), 0, 0);

    // Check if the slot is in the past
    if (sessionDateTime <= new Date()) {
      setError("Cannot schedule a session in the past");
      setLoading(false);
      isSubmittingRef.current = false;
      return;
    }

    try {
      setError(null);
      setSuccess(true);

      // Redirect to payment page after short delay
      // Session will be created after successful payment
      setTimeout(() => {
        const searchParams = new URLSearchParams({
          date: sessionDateTime.toISOString(),
          courseTitle: selectedSubject.subjectName,
          mentorName: mentorName,
          mentorId: String(mentor.id),
          mentorImg: mentor.profileImageUrl ?? "",
          subjectId: String(selectedSubject.id),
          duration: String(duration),
        });
        navigate(`/payment?${searchParams.toString()}`);
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Scheduling error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to process scheduling";
      setError(errorMessage);
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  // Disable past dates in calendar
  const disabledDays = { before: new Date() };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-600" />
            Schedule a Session
          </DialogTitle>
          <DialogDescription>
            Book a mentoring session with {mentorName}
          </DialogDescription>
        </DialogHeader>

        {/* Success State */}
        {success ? (
          <div className="py-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Session Scheduled!
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Redirecting to payment...
            </p>
          </div>
        ) : (
          <>
            {/* Mentor Info Card */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              {mentor.profileImageUrl ? (
                <img
                  src={mentor.profileImageUrl}
                  alt={mentorName}
                  className="w-14 h-14 rounded-full object-cover"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold">
                  {mentor.firstName.charAt(0)}
                  {mentor.lastName.charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  {mentorName}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                  {mentor.title || mentor.profession}
                </p>
                {mentor.isCertified && (
                  <Badge className="mt-1 bg-green-500 text-white text-xs">
                    Certified
                  </Badge>
                )}
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-red-800 dark:text-red-300">
                    Scheduling Error
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* Subject & Duration Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Subject Selection */}
              <div>
                <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-slate-500" />
                  Subject
                </Label>
                {mentor.subjects && mentor.subjects.length > 1 ? (
                  <Select
                    value={selectedSubject?.id.toString()}
                    onValueChange={(val) => {
                      const subject = mentor.subjects.find(
                        (s) => s.id.toString() === val
                      );
                      setSelectedSubject(subject || null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {mentor.subjects.map((subject) => (
                        <SelectItem
                          key={subject.id}
                          value={subject.id.toString()}
                        >
                          {subject.subjectName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {selectedSubject?.subjectName || "No subjects available"}
                  </div>
                )}
              </div>

              {/* Duration Selection */}
              <div>
                <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-500" />
                  Duration
                </Label>
                <Select
                  value={duration.toString()}
                  onValueChange={(val) => setDuration(Number(val))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATION_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value.toString()}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Date & Time Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Calendar */}
              <div>
                <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-slate-500" />
                  Choose a Date
                </Label>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => {
                    setDate(newDate);
                    setSelectedTime(undefined); // Reset time when date changes
                  }}
                  disabled={disabledDays}
                  className="rounded-lg border border-slate-200 dark:border-slate-700"
                />
              </div>

              {/* Time Slots */}
              <div>
                <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-500" />
                  Choose a Time
                  {loadingSlots && (
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                  )}
                </Label>

                {!date ? (
                  <div className="flex flex-col items-center justify-center h-48 rounded-lg border border-dashed border-slate-300 dark:border-slate-600">
                    <CalendarIcon className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="text-sm text-slate-500">
                      Select a date to see available times
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Legend */}
                    <div className="flex flex-wrap gap-3 text-xs">
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full bg-blue-600" />
                        Available
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full bg-red-400" />
                        Booked
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full bg-slate-300" />
                        Past
                      </span>
                    </div>

                    {/* Time Grid */}
                    <div className="grid grid-cols-3 gap-2 max-h-52 overflow-y-auto pr-2">
                      {availableSlots.map(({ time, status }) => {
                        const isSelected = selectedTime === time;
                        const isDisabled =
                          status === "booked" || status === "past";

                        return (
                          <Button
                            key={time}
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            disabled={isDisabled}
                            onClick={() => setSelectedTime(time)}
                            className={`relative ${isSelected
                                ? "bg-blue-600 hover:bg-blue-700 text-white"
                                : status === "booked"
                                  ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-400 cursor-not-allowed"
                                  : status === "past"
                                    ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                                    : "hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300"
                              }`}
                          >
                            {time}
                            {status === "booked" && (
                              <XCircle className="w-3 h-3 absolute top-1 right-1" />
                            )}
                          </Button>
                        );
                      })}
                    </div>

                    {/* Booked slots warning */}
                    {bookedSessions.length > 0 && (
                      <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-700 dark:text-amber-400">
                          {bookedSessions.length} session(s) already booked on
                          this day. Unavailable slots are marked in red.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Selected Summary */}
            {date && selectedTime && selectedSubject && (
              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
                  Session Summary
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                    <User className="w-4 h-4" />
                    {mentorName}
                  </div>
                  <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                    <BookOpen className="w-4 h-4" />
                    {selectedSubject.subjectName}
                  </div>
                  <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                    <CalendarIcon className="w-4 h-4" />
                    {date.toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                  <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                    <Clock className="w-4 h-4" />
                    {selectedTime} ({duration} min)
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline"  disabled={loading}>
                Cancel
              </Button>
              <Button
                onClick={handleSchedule}
                disabled={
                  !date || !selectedTime || !selectedSubject || loading
                }
                className="bg-blue-600 hover:bg-blue-700 min-w-[140px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Scheduling...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Confirm Booking
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
