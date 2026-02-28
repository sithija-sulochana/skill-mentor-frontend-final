import { useCallback, useEffect, useRef, useState } from "react";
import { MentorCard } from "@/components/MentorCard";
import { getPublicMentors } from "@/lib/api";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/clerk-react";
import type { Mentor } from "@/types";

export default function HomePage() {
  const { isSignedIn } = useAuth();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
        err instanceof Error ? err.message : "Unable to load mentors right now.",
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

  return (
    <div className="py-10">
      <div className="flex flex-col items-center justify-center space-y-8 text-center py-8">
        <div className="space-y-2">
          <h1 className="text-5xl tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
            Find your SkillMentor
          </h1>
          <p className="mx-auto text-gray-500 md:text-xl dark:text-gray-400 max-w-xs sm:max-w-full">
            Empower your career with personalized mentorship for AWS Developer{" "}
            <br className="hidden sm:block" />
            Associate, Interview Prep, and more.
          </p>
        </div>

        {isSignedIn ? (
          <Link to="/dashboard">
            <Button size="lg" className="text-xl">
              Go to Dashboard
            </Button>
          </Link>
        ) : (
          <Link to="/login">
            <Button size="lg" className="text-xl">
              Sign up to see all tutors
            </Button>
          </Link>
        )}
      </div>

      <div className="space-y-8 mt-8 container bg-background">
        <h1 className="lg:text-5xl md:text-4xl sm:text-3xl text-3xl">
          Schedule a Call
        </h1>

        {loading ? (
          <div className="text-center py-10 text-muted-foreground">
            Loading mentors...
          </div>
        ) : error ? (
          <div className="text-center py-10 space-y-4">
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={() => void loadMentors()} variant="outline">
              Retry
            </Button>
          </div>
        ) : mentors.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            No mentors available yet.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {mentors.map((mentor) => (
              <MentorCard key={mentor.id} mentor={mentor} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
