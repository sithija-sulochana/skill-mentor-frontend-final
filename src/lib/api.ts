import type { Enrollment, Mentor } from "@/types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
console.log("API Base URL:", API_BASE_URL);

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
  
  console.log(`API Request: ${options.method || "GET"} ${endpoint} - Status: ${res.status}`);

  if (!res.ok) {
    // Handle token expiration/authentication errors
    if (res.status === 401) {
      console.error("Authentication failed - token may be expired");
      throw new Error("Session expired. Please sign in again.");
    }
    
    if (res.status === 403) {
      console.error("Access forbidden");
      throw new Error("Access denied. You don't have permission for this action.");
    }

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

// Enrollments - matches backend SessionDTO
export interface EnrollSessionData {
  mentorId: number;  // Database mentor ID (Long)
  subjectId: number;
  sessionAt: string;
  durationMinutes?: number;
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

export interface PaymentCreateData {
  studentId: number;
  sessionId: number;
  receipt_url: string;
  note?: string;
}

export interface Payment {
  id: number;
  studentId: number;
  sessionId: number;
  receipt_url: string;
  note?: string;
  paymentStatus: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
}

export interface PaymentUpdateData {
  receipt_url?: string;
  note?: string;
  paymentStatus?: "PENDING" | "APPROVED" | "REJECTED";
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
 * Get student by database ID
 */
export async function getStudentById(
  token: string,
  id: number
): Promise<Student> {
  const res = await fetchWithAuth(`/api/v1/students/${id}`, token);
  return res.json();
}

/**
 * Get student by Clerk ID (studentId field in database)
 * Returns the student with their database ID
 */
export async function getStudentByClerkId(
  token: string,
  clerkId: string
): Promise<Student> {
  const res = await fetchWithAuth(`/api/v1/students/id/${clerkId}`, token);
  return res.json();
}

/**
 * Get all students (admin)
 */
export async function getAllStudents(token: string): Promise<Student[]> {
  const res = await fetchWithAuth("/api/v1/students", token);
  return res.json();

}


/**
 * Create a new payment
 */
export async function createPayment(token: string, data: PaymentCreateData): Promise<Payment> {
  const res = await fetchWithAuth("/api/v1/payment", token, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.json();
}

/**
 * Get all payments (admin)
 */
export async function getAllPayments(token: string): Promise<Payment[]> {
  const res = await fetchWithAuth("/api/v1/payment", token);
  return res.json();
}

/**
 * Get payment by ID
 */
export async function getPaymentById(token: string, id: number): Promise<Payment> {
  const res = await fetchWithAuth(`/api/v1/payment/${id}`, token);
  return res.json();
}

/**
 * Update payment (admin - change status)
 */
export async function updatePayment(token: string, id: number, data: PaymentUpdateData): Promise<Payment> {
  const res = await fetchWithAuth(`/api/v1/payment/${id}`, token, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return res.json();
}

/**
 * Delete payment
 */
export async function deletePayment(token: string, id: number): Promise<void> {
  await fetchWithAuth(`/api/v1/payment/${id}`, token, {
    method: "DELETE",
  });
}

/**
 * Upload payment receipt image
 * Compresses and converts file to base64
 * Returns the compressed base64 URL to be stored in receipt_url
 */
export async function uploadPaymentReceipt(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        // Compress the image
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions while maintaining aspect ratio
        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to compressed JPEG (quality 0.7)
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        resolve(compressedBase64);
      };
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      img.src = reader.result as string;
    };
    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Upload mentor profile image
 * Uses multipart/form-data for efficient file uploads
 * Returns the URL of the uploaded image
 */
export async function uploadMentorProfileImage(
  token: string,
  mentorId: string | number,
  file: File
): Promise<{ profileImageUrl: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE_URL}/api/v1/mentors/${mentorId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  console.log(`API Request: POST /api/v1/mentors/${mentorId}/profile-image - Status: ${res.status}`);

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("Session expired. Please sign in again.");
    }
    if (res.status === 403) {
      throw new Error("Access denied. You don't have permission for this action.");
    }
    const errorText = await res.text();
    let errorMessage = `HTTP ${res.status}`;
    try {
      const error = JSON.parse(errorText);
      errorMessage = error.message || error.error || errorMessage;
    } catch {
      errorMessage = errorText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return res.json();
}

/**
 * Update mentor profile image using base64
 * Alternative method when multipart upload endpoint is not available
 */
export async function updateMentorProfileImageBase64(
  token: string,
  mentorId: string | number,
  base64Image: string
): Promise<Mentor> {
  const res = await fetchWithAuth(`/api/v1/mentors/${mentorId}`, token, {
    method: "PUT",
    body: JSON.stringify({ profileImageUrl: base64Image }),
  });
  return res.json();
}