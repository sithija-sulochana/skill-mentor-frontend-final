import type { Enrollment, Mentor } from "@/types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";

async function fetchWithAuth(
  endpoint: string,
  token: string,
  options: RequestInit = {},
): Promise<Response> {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    let errorMessage = `HTTP ${res.status}`;
    try {
      const error = JSON.parse(errorText);
      errorMessage = error.message || error.error || errorMessage;
      console.error("API Error:", error);
    } catch {
      errorMessage = errorText || errorMessage;
      console.error("API Error (text):", errorText);
    }
    throw new Error(errorMessage);
  }

  return res;
}

// Public route without auth
export async function getPublicMentors(
  page = 0,
  size = 10,
): Promise<{ content: Mentor[]; totalElements: number; totalPages: number }> {
  const res = await fetch(
    `${API_BASE_URL}/api/v1/mentors?page=${page}&size=${size}`,
  );
  if (!res.ok) throw new Error("Failed to fetch mentors");
  return res.json();
}

// Enrollments
export interface EnrollSessionData {
  id: number;  // Database mentor ID (Long)
  subjectId: number;
  sessionAt: string;
  durationMinutes?: number;
  // Student info from Clerk
  studentEmail: string;
  studentFirstName: string;
  studentLastName: string;
  
}

export async function enrollInSession(
  token: string,
  data: EnrollSessionData,
): Promise<Enrollment> {
  const res = await fetchWithAuth("/api/v1/sessions/enroll", token, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function getMyEnrollments(token: string): Promise<Enrollment[]> {
  const res = await fetchWithAuth("/api/v1/sessions/my-sessions", token);
  return res.json();
}

// Student registration/sync
export interface StudentCreateData {
  studentId: string;    // Clerk user ID
  email: string;
  firstName: string;
  lastName: string;
  learningGoals?: string;
}

export interface Student {
  id: number;
  studentId: string;
  email: string;
  firstName: string;
  lastName: string;
  learningGoals?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Register/create student in backend.
 * Sends Clerk user credentials in the request body.
 * Called automatically when user logs in via Clerk.
 */
export async function createStudent(
  token: string,
  data: StudentCreateData
): Promise<Student> {
  const res = await fetchWithAuth("/api/v1/students", token, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.json();
}

/**
 * Get student by ID
 */
export async function getStudentById(
  token: string,
  id: number
): Promise<Student> {
  const res = await fetchWithAuth(`/api/v1/students/${id}`, token);
  return res.json();
}

/**
 * Get all students (admin)
 */
export async function getAllStudents(token: string): Promise<Student[]> {
  const res = await fetchWithAuth("/api/v1/students", token);
  return res.json();
}
