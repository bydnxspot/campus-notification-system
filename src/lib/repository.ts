/**
 * Local demo storage (browser localStorage). NOT MySQL.
 * Every function here maps 1:1 to a future REST endpoint (e.g. Laravel controller),
 * so the UI can later swap this module for fetch() calls without changes.
 */
import { useSyncExternalStore } from "react";
import { makeSeed } from "./seed";
import { canEditAnnouncement, canManageUsers, isAdminRole, matchesAudience } from "./rules";
import type { Announcement, DB, User } from "./types";

const KEY = "unams:db:v1";
const SESSION = "unams:session:v1";
let cache: DB | null = null;
let serverSnapshot: DB | null = null;
const listeners = new Set<() => void>();
const uid = () => crypto.randomUUID();
const nowIso = () => new Date().toISOString();

function load(): DB {
  if (cache) return cache;
  if (typeof window === "undefined") return getServerSnapshot();
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? (JSON.parse(raw) as DB) : makeSeed();
  } catch { cache = makeSeed(); }
  if (!localStorage.getItem(KEY)) localStorage.setItem(KEY, JSON.stringify(cache));
  return cache;
}
function save(next: DB) {
  try { localStorage.setItem(KEY, JSON.stringify(next)); }
  catch { throw new Error("Browser storage is unavailable or full. Allow local storage or clear space, then try again."); }
  cache = next;
  listeners.forEach((l) => l());
}
function mutate(fn: (db: DB) => void) { const db = structuredClone(load()); fn(db); save(db); }
function log(db: DB, actorId: string, action: string, target: string) {
  db.activity.unshift({ id: uid(), actorId, action, target, at: nowIso() });
}
export function subscribe(l: () => void) {
  listeners.add(l);
  const onStorage = (e: StorageEvent) => { if (e.key === KEY || e.key === SESSION) { cache = null; l(); } };
  window.addEventListener("storage", onStorage);
  return () => { listeners.delete(l); window.removeEventListener("storage", onStorage); };
}
function getServerSnapshot(): DB { return serverSnapshot ??= makeSeed(); }
export const useDb = () => useSyncExternalStore(subscribe, load, getServerSnapshot);

// ---- auth (demo only: plaintext passwords in local storage) ----
export function getSessionUser(): User | null {
  const id = typeof window === "undefined" ? null : localStorage.getItem(SESSION);
  return load().users.find((u) => u.id === id && u.active) ?? null;
}
export function useSessionUser() { return useSyncExternalStore(subscribe, getSessionUser, () => null); }
export function login(email: string, password: string): User {
  const u = load().users.find((x) => x.email.toLowerCase() === email.trim().toLowerCase());
  if (!u || u.password !== password) throw new Error("Invalid email or password.");
  if (!u.active) throw new Error("This account has been deactivated.");
  localStorage.setItem(SESSION, u.id);
  listeners.forEach((l) => l());
  return u;
}
export function logout() { localStorage.removeItem(SESSION); listeners.forEach((l) => l()); }
export function resetDemoData() { save(makeSeed()); localStorage.removeItem(SESSION); listeners.forEach((l) => l()); }

// ---- announcements ----
export type AnnouncementInput = Omit<Announcement, "id" | "authorId" | "createdAt" | "updatedAt">;
function requireStaff(actor: User) { if (!isAdminRole(actor.role)) throw new Error("Not permitted."); }
function notify(db: DB, a: Announcement) {
  db.users.filter((u) => u.active && u.id !== a.authorId && matchesAudience(u, a.audience) && u.role !== "sysadmin")
    .forEach((u) => {
      if (!db.notifications.some((n) => n.userId === u.id && n.announcementId === a.id))
        db.notifications.unshift({ id: uid(), userId: u.id, announcementId: a.id, read: false, createdAt: nowIso() });
    });
}
export function createAnnouncement(actor: User, input: AnnouncementInput): Announcement {
  requireStaff(actor);
  const a: Announcement = { ...input, id: uid(), authorId: actor.id, createdAt: nowIso(), updatedAt: nowIso() };
  mutate((db) => { db.announcements.unshift(a); log(db, actor.id, "Created announcement", a.title);
    if (a.status === "published") { notify(db, a); log(db, actor.id, "Published announcement", a.title); } });
  return a;
}
function editOwn(actor: User, id: string, fn: (a: Announcement, db: DB) => void) {
  mutate((db) => {
    const a = db.announcements.find((x) => x.id === id);
    if (!a) throw new Error("Announcement not found.");
    if (!canEditAnnouncement(actor, a)) throw new Error("You can only manage your own announcements.");
    fn(a, db); a.updatedAt = nowIso();
  });
}
export function updateAnnouncement(actor: User, id: string, input: AnnouncementInput) {
  editOwn(actor, id, (a, db) => { const was = a.status; Object.assign(a, input); log(db, actor.id, "Edited announcement", a.title);
    if (was !== "published" && a.status === "published") { notify(db, a); log(db, actor.id, "Published announcement", a.title); } });
}
export function setStatus(actor: User, id: string, status: Announcement["status"]) {
  editOwn(actor, id, (a, db) => {
    const verb = status === "published" ? (a.status === "archived" ? "Restored & published" : "Published")
      : status === "archived" ? "Archived" : a.status === "archived" ? "Restored" : "Unpublished";
    a.status = status; if (status === "published") notify(db, a);
    log(db, actor.id, `${verb} announcement`, a.title);
  });
}
export function deleteAnnouncement(actor: User, id: string) {
  editOwn(actor, id, (a, db) => {
    db.announcements = db.announcements.filter((x) => x.id !== id);
    db.notifications = db.notifications.filter((n) => n.announcementId !== id);
    log(db, actor.id, "Deleted announcement", a.title);
  });
}

// ---- notifications ----
export function markRead(userId: string, id?: string) {
  mutate((db) => db.notifications.forEach((n) => { if (n.userId === userId && (!id || n.id === id)) n.read = true; }));
}

// ---- users ----
export function updateUser(actor: User, id: string, patch: Partial<Pick<User, "role" | "faculty" | "department" | "level" | "active">>) {
  if (!canManageUsers(actor)) throw new Error("Only the System Administrator can manage users.");
  if (id === actor.id && (patch.active === false || (patch.role && patch.role !== "sysadmin")))
    throw new Error("You cannot deactivate or demote your own account.");
  mutate((db) => {
    const u = db.users.find((x) => x.id === id); if (!u) throw new Error("User not found.");
    const changes: string[] = [];
    if (patch.role && patch.role !== u.role) changes.push(`role → ${patch.role}`);
    if (patch.active !== undefined && patch.active !== u.active) changes.push(patch.active ? "activated" : "deactivated");
    if (["faculty", "department", "level"].some((k) => k in patch && (patch as Record<string, unknown>)[k] !== (u as unknown as Record<string, unknown>)[k])) changes.push("placement updated");
    Object.assign(u, patch);
    log(db, actor.id, `Updated user (${changes.join(", ") || "no change"})`, u.name);
  });
}