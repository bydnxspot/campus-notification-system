import { pageHead } from "@/lib/page-head";
import { createFileRoute, Link, Navigate, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, ClipboardList, FileText, LayoutDashboard, LogOut, Megaphone, Menu, PlusCircle, RotateCcw, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { PrototypeNotice } from "@/components/app/PrototypeNotice";
import { logout, resetDemoData, useDb, useSessionUser } from "@/lib/repository";
import { isAdminRole, isVisibleTo } from "@/lib/rules";
import { ROLE_LABELS, type User } from "@/lib/types";

export const Route = createFileRoute("/app")({
  ssr: false,
  head: () => pageHead("Portal", "Role-based navigation for the offline university notice demo."),
  component: AppLayout,
});

function navFor(u: User) {
  const items = [
    { to: "/app", label: "Dashboard", icon: LayoutDashboard },
    { to: "/app/notices", label: "Notices", icon: FileText },
    { to: "/app/notifications", label: "Notifications", icon: Bell },
  ] as const;
  const staff = [
    { to: "/app/manage", label: "Manage announcements", icon: Megaphone },
    { to: "/app/manage/new", label: "New announcement", icon: PlusCircle },
    { to: "/app/activity", label: "Activity log", icon: ClipboardList },
  ] as const;
  const out: { to: string; label: string; icon: typeof Bell }[] = [...items];
  if (isAdminRole(u.role)) out.push(...staff);
  if (u.role === "sysadmin") out.push({ to: "/app/users", label: "User management", icon: Users });
  return out;
}

function AppLayout() {
  const user = useSessionUser(); const db = useDb(); const nav = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false); const [confirmReset, setConfirmReset] = useState(false);
  if (!user) return <Navigate to="/" />;
  const unread = db.notifications.filter((n) => n.userId === user.id && !n.read && db.announcements.some((a) => a.id === n.announcementId && isVisibleTo(user, a))).length;
  const signOut = () => { logout(); nav({ to: "/", replace: true }); };

  const Sidebar = (
    <nav aria-label="Main" className="flex h-full flex-col gap-1 bg-sidebar p-3 text-sidebar-foreground">
      <div className="mb-4 flex items-center gap-2 px-2 py-2">
        <Megaphone className="h-5 w-5" /><span className="font-serif text-lg font-bold">UniNotice</span>
      </div>
      {navFor(user).map((i) => {
        const active = path === i.to;
        return (
          <Link key={i.to} to={i.to} onClick={() => setOpen(false)}
            className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${active ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/60"}`}>
            <i.icon className="h-4 w-4" />{i.label}
            {i.to === "/app/notifications" && unread > 0 && <span className="ml-auto rounded-full bg-destructive px-1.5 text-xs text-destructive-foreground">{unread}</span>}
          </Link>
        );
      })}
      <div className="mt-auto grid gap-1 border-t border-sidebar-border pt-3">
        <Button variant="ghost" onClick={() => setConfirmReset(true)} className="justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"><RotateCcw className="h-4 w-4" />Reset demo data</Button>
        <Button variant="ghost" onClick={signOut} className="justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"><LogOut className="h-4 w-4" />Sign out</Button>
      </div>
    </nav>
  );

  return (
    <div className="flex min-h-screen flex-col">
      <PrototypeNotice />
      <div className="flex flex-1">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 md:block">{Sidebar}</aside>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="left" className="w-64 p-0"><SheetTitle className="sr-only">Navigation</SheetTitle>{Sidebar}</SheetContent>
        </Sheet>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b bg-card px-4">
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu" onClick={() => setOpen(true)}><Menu /></Button>
            <span className="hidden text-sm text-muted-foreground sm:block">University Notice &amp; Announcement Management System</span>
            <div className="ml-auto flex items-center gap-3">
              <Link to="/app/notifications" aria-label={`Notifications, ${unread} unread`} className="relative rounded-md p-2 hover:bg-muted">
                <Bell className="h-5 w-5" />
                {unread > 0 && <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-destructive" />}
              </Link>
              <div className="text-right leading-tight">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{ROLE_LABELS[user.role]}{user.level ? ` · ${user.level}L` : ""}</p>
              </div>
            </div>
          </header>
          <main className="mx-auto w-full max-w-6xl flex-1 p-4 md:p-8"><Outlet /></main>
        </div>
      </div>
      <AlertDialog open={confirmReset} onOpenChange={setConfirmReset}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Reset demo data?</AlertDialogTitle>
            <AlertDialogDescription>All changes in this browser will be replaced with the original sample data and you will be signed out.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { resetDemoData(); toast.success("Demo data reset"); nav({ to: "/" }); }}>Reset</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}