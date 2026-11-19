import { beforeEach, describe, expect, it } from "vitest";
import { makeSeed } from "@/lib/seed";
import { canEditAnnouncement, canManageUsers, isVisibleTo, matchesAudience, today } from "@/lib/rules";
import { createAnnouncement, deleteAnnouncement, getSessionUser, login, logout, resetDemoData, setStatus, updateAnnouncement, updateUser, markRead } from "@/lib/repository";
import { applyFilters, emptyFilters } from "@/components/app/Filters";
import { validate } from "@/components/app/AnnouncementForm";
import type { Announcement, DB, User } from "@/lib/types";

const seed = () => makeSeed();
function user(id: string): User {
  const value = seed().users.find((u) => u.id === id);
  if (!value) throw new Error("Missing test user");
  return value;
}
function notice(patch: Partial<Announcement> = {}): Announcement {
  const value = seed().announcements[0];
  if (!value) throw new Error("Missing seed notice");
  return { ...value, ...patch };
}
function stored(): DB { return JSON.parse(localStorage.getItem("unams:db:v1") ?? "{}"); }
const input = () => ({ title: "Demo defence notice", body: "Please attend the Computer Science project defence briefing.", category: "Academic" as const, priority: "important" as const, publishDate: today(), audience: { scope: "level" as const, department: "Computer Science", level: "400" }, status: "draft" as const });

describe("Audience and permissions", () => {
  it("matches all-university, faculty, department and level targeting", () => {
    const s = user("u-stu");
    expect(matchesAudience(s, { scope: "all" })).toBe(true);
    expect(matchesAudience(s, { scope: "faculty", faculty: "Natural and Applied Sciences" })).toBe(true);
    expect(matchesAudience(s, { scope: "faculty", faculty: "Arts" })).toBe(false);
    expect(matchesAudience(s, { scope: "department", department: "English" })).toBe(false);
    expect(matchesAudience(s, { scope: "level", level: "400", department: "Computer Science" })).toBe(true);
    expect(matchesAudience(user("u-stu2"), { scope: "level", level: "400", department: "Computer Science" })).toBe(false);
  });
  it.each(["draft", "archived"] as const)("excludes %s notices from students", (status) => {
    expect(isVisibleTo(user("u-stu"), notice({ status }))).toBe(false);
  });
  it("excludes future and expired publications but includes boundary dates", () => {
    const s = user("u-stu");
    expect(isVisibleTo(s, notice({ publishDate: "2026-11-19", expiryDate: undefined }), "2026-11-18")).toBe(false);
    expect(isVisibleTo(s, notice({ publishDate: "2026-11-01", expiryDate: "2026-11-17" }), "2026-11-18")).toBe(false);
    expect(isVisibleTo(s, notice({ publishDate: "2026-11-18", expiryDate: "2026-11-18" }), "2026-11-18")).toBe(true);
  });
  it("allows sysadmin to edit any notice, staff only their own, and students none", () => {
    const a = notice({ authorId: "u-dept" });
    expect(canEditAnnouncement(user("u-admin"), a)).toBe(true);
    expect(canEditAnnouncement(user("u-dept"), a)).toBe(true);
    expect(canEditAnnouncement(user("u-fac"), a)).toBe(false);
    expect(canEditAnnouncement(user("u-stu"), notice({ authorId: "u-stu" }))).toBe(false);
  });
  it("reserves user management for System Administrator", () => {
    expect(canManageUsers(user("u-admin"))).toBe(true);
    for (const u of seed().users.filter((u) => u.role !== "sysadmin")) expect(canManageUsers(u)).toBe(false);
  });
});

describe("Stored demo lifecycle", () => {
  beforeEach(() => { localStorage.clear(); resetDemoData(); });
  it("signs in every listed account and persists the session", () => {
    for (const u of seed().users.filter((u) => u.active)) {
      expect(login(u.email, u.password).id).toBe(u.id);
      expect(getSessionUser()?.id).toBe(u.id);
      expect(localStorage.getItem("unams:session:v1")).toBe(u.id);
      logout(); expect(getSessionUser()).toBeNull();
    }
  });
  it("rejects incorrect passwords and inactive accounts", () => {
    expect(() => login("admin@demo.edu", "wrong")).toThrow("Invalid email or password");
    expect(() => login("inactive@demo.edu", "student123")).toThrow("deactivated");
  });
  it("stores create, edit, publish, archive, restore, and republication", () => {
    const admin = login("admin@demo.edu", "admin123");
    const a = createAnnouncement(admin, input());
    updateAnnouncement(admin, a.id, { ...input(), title: "Updated defence notice" });
    expect(stored().announcements.find((x) => x.id === a.id)?.title).toBe("Updated defence notice");
    setStatus(admin, a.id, "published");
    expect(stored().notifications.filter((n) => n.announcementId === a.id).map((n) => n.userId)).toEqual(["u-stu"]);
    setStatus(admin, a.id, "archived");
    expect(isVisibleTo(user("u-stu"), stored().announcements.find((x) => x.id === a.id) ?? a)).toBe(false);
    setStatus(admin, a.id, "draft");
    expect(stored().announcements.find((x) => x.id === a.id)?.status).toBe("draft");
    setStatus(admin, a.id, "published");
    expect(stored().notifications.filter((n) => n.announcementId === a.id)).toHaveLength(1);
    deleteAnnouncement(admin, a.id);
    expect(stored().announcements.some((x) => x.id === a.id)).toBe(false);
    expect(stored().notifications.some((n) => n.announcementId === a.id)).toBe(false);
  });
  it("marks only the selected student's notification read", () => {
    markRead("u-stu", "nt1");
    expect(stored().notifications.find((n) => n.id === "nt1")?.read).toBe(true);
    expect(stored().notifications.find((n) => n.id === "nt2")?.read).toBe(false);
    markRead("u-stu");
    expect(stored().notifications.filter((n) => n.userId === "u-stu").every((n) => n.read)).toBe(true);
  });
  it("unpublishes a current notice without deleting it or its notification", () => {
    const admin = login("admin@demo.edu", "admin123");
    const a = createAnnouncement(admin, { ...input(), status: "published" });
    expect(isVisibleTo(user("u-stu"), a)).toBe(true);
    setStatus(admin, a.id, "draft");
    const saved = stored().announcements.find((x) => x.id === a.id);
    expect(saved?.status).toBe("draft");
    expect(saved && isVisibleTo(user("u-stu"), saved)).toBe(false);
    expect(stored().notifications.filter((n) => n.announcementId === a.id)).toHaveLength(1);
  });
  it("refuses student writes, other staff ownership violations and self-demotion", () => {
    expect(() => createAnnouncement(user("u-stu"), input())).toThrow("Not permitted");
    expect(() => setStatus(user("u-dept"), "n1", "archived")).toThrow("own announcements");
    expect(() => updateUser(user("u-fac"), "u-stu", { active: false })).toThrow("System Administrator");
    expect(() => updateUser(user("u-admin"), "u-admin", { active: false })).toThrow("own account");
    expect(() => updateUser(user("u-admin"), "u-admin", { role: "student" })).toThrow("own account");
  });
  it("reset restores eleven realistic notices and clears the session", () => {
    login("admin@demo.edu", "admin123");
    createAnnouncement(user("u-admin"), input()); resetDemoData();
    expect(stored().announcements).toHaveLength(11);
    expect(getSessionUser()).toBeNull();
    for (const category of ["Examination", "Registration", "Hostel", "Scholarships", "Emergency Notices"]) {
      expect(stored().announcements.some((a) => a.category === category)).toBe(true);
    }
  });
});

describe("Search and form rules", () => {
  it("combines case-insensitive content search, category, priority and inclusive dates", () => {
    const a = notice({ title: "Demo examination", body: "Bring your REGISTRATION slip", category: "Examination", priority: "important", publishDate: "2026-11-18" });
    const filters = { q: "registration", category: "Examination", priority: "important", from: "2026-11-18", to: "2026-11-18" };
    expect(applyFilters([a], filters)).toEqual([a]);
    expect(applyFilters([a], { ...filters, priority: "urgent" })).toEqual([]);
    expect(applyFilters([a], { ...filters, from: "2026-11-19" })).toEqual([]);
    expect(applyFilters([a], emptyFilters)).toEqual([a]);
  });
  it("requires title of 5–150 characters, body of 20+, publication date and valid expiry", () => {
    expect(validate(input())).toEqual({});
    expect(validate({ ...input(), title: "four" })["title"]).toBeDefined();
    expect(validate({ ...input(), title: "x".repeat(151) })["title"]).toBeDefined();
    expect(validate({ ...input(), body: "x".repeat(19) })["body"]).toBeDefined();
    expect(validate({ ...input(), publishDate: "" })["publishDate"]).toBeDefined();
    expect(validate({ ...input(), publishDate: "2026-11-18", expiryDate: "2026-11-17" })["expiryDate"]).toBeDefined();
  });
});