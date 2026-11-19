import type { Announcement, Audience, Role, User } from "./types";

export const today = () => new Date().toISOString().slice(0, 10);
export const isAdminRole = (r: Role) => r !== "student";
export const canManageUsers = (u: User) => u.role === "sysadmin";
/** Sysadmin may edit any notice; other staff only their own. */
export const canEditAnnouncement = (u: User, a: Announcement) =>
  u.role === "sysadmin" || (isAdminRole(u.role) && a.authorId === u.id);

export function matchesAudience(user: User, aud: Audience): boolean {
  if (user.role === "sysadmin") return true;
  switch (aud.scope) {
    case "all": return true;
    case "faculty": return user.faculty === aud.faculty;
    case "department": return user.department === aud.department;
    case "level": return user.level === aud.level && (!aud.department || user.department === aud.department);
  }
}
/** Visible to readers: published, publish date reached, not expired, audience match. */
export function isVisibleTo(user: User, a: Announcement, now = today()): boolean {
  if (a.status !== "published") return false;
  if (a.publishDate > now) return false;
  if (a.expiryDate && a.expiryDate < now) return false;
  return matchesAudience(user, a.audience);
}
export function audienceLabel(a: Audience) {
  if (a.scope === "all") return "All university";
  if (a.scope === "faculty") return `Faculty of ${a.faculty}`;
  if (a.scope === "department") return `Dept. of ${a.department}`;
  return `${a.level} Level${a.department ? ` · ${a.department}` : ""}`;
}