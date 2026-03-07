// Modified to match with backend SubjectResponseDTO
export interface Subject {
  id: number;
  subjectName: string;
  description: string;
  courseImageUrl: string;
}

// Modified to match with backend MentorResponseDTO (from GET /api/v1/mentors)
export interface Mentor {
  id: number;
  mentorId: string;
  firstName: string;
  lastName: string;
  email: string;
  title: string;
  profession: string;
  company: string;
  experienceYears: number;
  bio: string;
  profileImageUrl: string;
  positiveReviews: number;
  totalEnrollments: number;
  isCertified: boolean;
  startYear: string;
  subjects: Subject[];
}

// Modified to match with backend Session entity / SessionResponseDTO
export interface Enrollment {
  id: number;
  studentId?: number;
  mentorId?: number;
  mentorName: string;
  mentorProfileImageUrl: string;
  subjectId?: number;
  subjectName: string;
  sessionAt: string;
  durationMinutes: number;
  sessionStatus: string;
  meetingLink: string | null;
  sessionNotes?: string | null;
  studentReview?: string | null;
  studentRating?: number | null;
  paymentStatus: "PENDING" | "APPROVED" | "REJECTED" | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}
