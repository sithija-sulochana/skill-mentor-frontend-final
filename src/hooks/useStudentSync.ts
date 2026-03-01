import { useEffect, useRef } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { createStudent } from "@/lib/api";

/**
 * Hook that automatically registers the logged-in Clerk user with the backend database.
 * Creates a new student record if they don't exist.
 * Sends Clerk user credentials (studentId, email, firstName, lastName) in the request body.
 * Should be called once in a top-level component (e.g., Layout).
 */
export function useStudentSync() {
  const { isSignedIn, getToken } = useAuth();
  const { user, isLoaded } = useUser();
  const hasSynced = useRef(false);

  useEffect(() => {
    // Only sync once per session, and only when user is fully loaded and signed in
    if (!isLoaded || !isSignedIn || !user || hasSynced.current) {
      return;
    }

    const performSync = async () => {
      try {
        const token = await getToken({ template: "skill-mentor" });
        if (!token) {
          console.warn("No auth token available for student sync");
          return;
        }

        // Extract user credentials from Clerk
        const email =
          user.primaryEmailAddress?.emailAddress ||
          user.emailAddresses[0]?.emailAddress ||
          "";

        if (!email) {
          console.warn("No email found for user, skipping sync");
          return;
        }

        // Build student data from Clerk user
        const studentData = {
          studentId: user.id,           // Clerk user ID
          email: email,
          firstName: user.firstName || "",
          lastName: user.lastName || "",
        };

        console.log(token)

        // Send credentials to backend
        const student = await createStudent(token, studentData);
        console.log("Student sync successful:", student);
        console.log("Student registered successfully:", student.id);
        hasSynced.current = true;
      } catch (error) {
        // Don't block the app if sync fails
        
        console.error("Failed to register student:", error);
        
        // If student already exists (409 Conflict) or endpoint doesn't exist (404), don't retry
        if (error instanceof Error && 
            (error.message.includes("409") || 
             error.message.includes("404") ||
             error.message.includes("already exists") ||
             error.message.includes("duplicate"))) {
          hasSynced.current = true;
        }
      }
    };

    performSync();
  }, [isSignedIn, isLoaded, user, getToken]);

  // Reset sync flag if user signs out
  useEffect(() => {
    if (!isSignedIn) {
      hasSynced.current = false;
    }
  }, [isSignedIn]);
}
