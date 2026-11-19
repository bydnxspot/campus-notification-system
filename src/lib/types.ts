export type Role = "sysadmin" | "faculty_admin" | "dept_admin" | "student_affairs" | "lecturer" | "student";
export const ROLE_LABELS: Record<Role, string> = {
  sysadmin: "System Administrator",
  faculty_admin: "Faculty Administrator",
  dept_admin: "Department Administrator",
  student_affairs: "Student Affairs Office",
  lecturer: "Lecturer",
  student: "Student",
};
export const ROLES = Object.keys(ROLE_LABELS) as Role[];

export const CATEGORIES = [
  "Academic", "Examination", "Registration", "Hostel", "Scholarships", "Student Affairs",
  "Faculty Notices", "Department Notices", "Events", "Sports", "Emergency Notices",
] as const;
export type Category = (typeof CATEGORIES)[number];
export const PRIORITIES = ["normal", "important", "urgent"] as const;
export type Priority = (typeof PRIORITIES)[number];
export type Status = "draft" | "published" | "archived";
export const LEVELS = ["100", "200", "300", "400"];
export const FACULTIES: Record<string, string[]> = {
  "Natural and Applied Sciences": ["Computer Science", "Mathematics", "Physics"],
  Arts: ["English", "History"],
  Administration: ["Accounting", "Business Administration"],
};

export interface User {
  id: string; name: string; email: string; password: string; role: Role;
  faculty?: string | undefined; department?: string | undefined; level?: string | undefined; active: boolean;
}
export interface Audience { scope: "all" | "faculty" | "department" | "level"; faculty?: string | undefined; department?: string | undefined; level?: string | undefined }
export interface Attachment { name: string; sizeKb: number; type: string }
export interface Announcement {
  id: string; title: string; body: string; category: Category; priority: Priority;
  publishDate: string; expiryDate?: string | undefined; audience: Audience; status: Status;
  attachment?: Attachment | undefined; authorId: string; createdAt: string; updatedAt: string;
}
export interface Notification { id: string; userId: string; announcementId: string; read: boolean; createdAt: string }
export interface Activity { id: string; actorId: string; action: string; target: string; at: string }
export interface DB { version: 1; users: User[]; announcements: Announcement[]; notifications: Notification[]; activity: Activity[] }