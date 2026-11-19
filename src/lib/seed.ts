import type { Announcement, DB, User } from "./types";

const d = (offset: number) => { const t = new Date(); t.setDate(t.getDate() + offset); return t.toISOString().slice(0, 10); };

export function makeSeed(): DB {
  const users: User[] = [
    { id: "u-admin", name: "Amina Bello", email: "admin@demo.edu", password: "admin123", role: "sysadmin", active: true },
    { id: "u-fac", name: "Dr. Musa Ibrahim", email: "faculty@demo.edu", password: "faculty123", role: "faculty_admin", faculty: "Natural and Applied Sciences", active: true },
    { id: "u-dept", name: "Mrs. Grace Okoro", email: "dept@demo.edu", password: "dept123", role: "dept_admin", faculty: "Natural and Applied Sciences", department: "Computer Science", active: true },
    { id: "u-sao", name: "Student Affairs Desk", email: "affairs@demo.edu", password: "affairs123", role: "student_affairs", active: true },
    { id: "u-lect", name: "Mr. Daniel Audu", email: "lecturer@demo.edu", password: "lecturer123", role: "lecturer", faculty: "Natural and Applied Sciences", department: "Computer Science", active: true },
    { id: "u-stu", name: "Joseph Adeyemi", email: "student@demo.edu", password: "student123", role: "student", faculty: "Natural and Applied Sciences", department: "Computer Science", level: "400", active: true },
    { id: "u-stu2", name: "Fatima Sani", email: "fatima@demo.edu", password: "student123", role: "student", faculty: "Arts", department: "English", level: "200", active: true },
    { id: "u-stu3", name: "Inactive Student", email: "inactive@demo.edu", password: "student123", role: "student", faculty: "Administration", department: "Accounting", level: "100", active: false },
  ];
  const now = new Date().toISOString();
  const a = (p: Partial<Announcement> & Pick<Announcement, "id" | "title" | "body" | "category">): Announcement => ({
    priority: "normal", publishDate: d(-2), audience: { scope: "all" }, status: "published",
    authorId: "u-admin", createdAt: now, updatedAt: now, ...p,
  });
  const announcements: Announcement[] = [
    a({ id: "n1", title: "First Semester Examination Timetable Released", category: "Examination", priority: "important", publishDate: d(-1), expiryDate: d(30),
      body: "The provisional timetable for first semester examinations is now available. Students should confirm course codes, venues and times, and report clashes to their department exams officer within one week.",
      attachment: { name: "exam-timetable-first-semester.pdf", sizeKb: 412, type: "application/pdf" } }),
    a({ id: "n2", title: "Course Registration Deadline Extended", category: "Registration", priority: "urgent", publishDate: d(-3), expiryDate: d(10),
      body: "Course registration for the current session has been extended by two weeks. Students who have not completed registration should do so promptly; late registration attracts a penalty after the new deadline." }),
    a({ id: "n3", title: "Computer Science 400 Level Project Defence Schedule", category: "Department Notices", publishDate: d(-1), authorId: "u-dept",
      audience: { scope: "level", level: "400", department: "Computer Science" },
      body: "Final year project defences will hold in the department seminar room. Each student should bring three bound copies of their report and a short slide presentation." }),
    a({ id: "n4", title: "Hostel Allocation Portal Opens", category: "Hostel", publishDate: d(-5), expiryDate: d(14), authorId: "u-sao",
      body: "Hostel bed space applications are open to returning students. Allocation is first-come, first-served subject to payment confirmation. Keep your receipt for verification." }),
    a({ id: "n5", title: "Merit Scholarship Applications Invited", category: "Scholarships", priority: "important", publishDate: d(-4), expiryDate: d(21), authorId: "u-sao",
      body: "Applications are invited from students with a minimum CGPA of 4.00 for the merit scholarship. Submit a cover letter, transcript and recommendation letter to the Student Affairs Office.",
      attachment: { name: "scholarship-form.docx", sizeKb: 88, type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" } }),
    a({ id: "n6", title: "Emergency: Water Supply Interruption on Main Campus", category: "Emergency Notices", priority: "urgent", publishDate: d(0), expiryDate: d(3),
      body: "Due to maintenance on the main pipeline, water supply to hostels and lecture halls will be interrupted for 24 hours. Tankers will be stationed at designated points." }),
    a({ id: "n7", title: "Faculty of Sciences Lecture Resumption Notice", category: "Faculty Notices", publishDate: d(-6), authorId: "u-fac",
      audience: { scope: "faculty", faculty: "Natural and Applied Sciences" },
      body: "Lectures for all departments in the Faculty of Natural and Applied Sciences resume on Monday. Lecturers should share updated course outlines in the first week." }),
    a({ id: "n8", title: "Revised Academic Calendar", category: "Academic", publishDate: d(-8),
      body: "The Senate has approved a revised academic calendar for the session. Key dates for lectures, examinations and breaks are summarised in the attached document.",
      attachment: { name: "academic-calendar.pdf", sizeKb: 230, type: "application/pdf" } }),
    a({ id: "n9", title: "Inter-Faculty Sports Week (Draft)", category: "Sports", status: "draft", publishDate: d(7), authorId: "u-sao",
      body: "Draft details for the upcoming inter-faculty sports week. Fixtures to be confirmed." }),
    a({ id: "n10", title: "Old Orientation Programme Notice", category: "Events", status: "archived", publishDate: d(-60), expiryDate: d(-40),
      body: "Orientation for new students held in the main auditorium. This notice has been archived." }),
    a({ id: "n11", title: "English Department Reading Week", category: "Department Notices", publishDate: d(-2), authorId: "u-admin",
      audience: { scope: "department", department: "English" },
      body: "The Department of English announces a reading week with guest talks and a book exhibition in the faculty library." }),
  ];
  const notifications = [
    { id: "nt1", userId: "u-stu", announcementId: "n6", read: false, createdAt: now },
    { id: "nt2", userId: "u-stu", announcementId: "n1", read: false, createdAt: now },
    { id: "nt3", userId: "u-stu", announcementId: "n3", read: true, createdAt: now },
  ];
  return { version: 1, users, announcements, notifications, activity: [
    { id: "ac1", actorId: "u-admin", action: "Seeded demo data", target: "System", at: now },
  ] };
}