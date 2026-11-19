import { pageHead } from "@/lib/page-head";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Archive, FilePen, FileText, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Empty, NoticeCard, PageHeader, StatusBadge, fmtDate } from "@/components/app/bits";
import { useDb, useSessionUser } from "@/lib/repository";
import { isAdminRole, isVisibleTo } from "@/lib/rules";

export const Route = createFileRoute("/app/")({ head: () => pageHead("Dashboard", "Relevant university notices and announcement statistics."), component: Dashboard });

function Dashboard() {
  const db = useDb(); const user = useSessionUser();
  if (!user) return null;
  const visible = db.announcements.filter((a) => isVisibleTo(user, a)).sort((a, b) => b.publishDate.localeCompare(a.publishDate));
  const unreadIds = new Set(db.notifications.filter((n) => n.userId === user.id && !n.read).map((n) => n.announcementId));

  if (!isAdminRole(user.role)) {
    const urgent = visible.filter((a) => a.priority === "urgent");
    return (
      <>
        <PageHeader title={`Hello, ${user.name.split(" ")[0]}`} desc={`${user.department ?? ""} · ${user.level ?? ""} Level — notices relevant to you`}
          action={<Button asChild variant="outline"><Link to="/app/notices">Search all notices</Link></Button>} />
        {urgent.length > 0 && <section className="mb-6"><h2 className="mb-2 text-lg font-semibold text-destructive">Urgent</h2>
          <div className="grid gap-3 md:grid-cols-2">{urgent.map((a) => <NoticeCard key={a.id} a={a} unread={unreadIds.has(a.id)} />)}</div></section>}
        <h2 className="mb-2 text-lg font-semibold">Latest notices</h2>
        {visible.length ? <div className="grid gap-3 md:grid-cols-2">{visible.filter((a) => a.priority !== "urgent").map((a) => <NoticeCard key={a.id} a={a} unread={unreadIds.has(a.id)} />)}</div>
          : <Empty title="No notices right now">New notices for your faculty, department or level will appear here.</Empty>}
      </>
    );
  }
  const count = (s: string) => db.announcements.filter((a) => a.status === s).length;
  const stats = [
    { label: "Published", value: count("published"), icon: FileText },
    { label: "Drafts", value: count("draft"), icon: FilePen },
    { label: "Archived", value: count("archived"), icon: Archive },
    { label: "Users", value: db.users.length, sub: `${db.users.filter((u) => u.active).length} active`, icon: Users },
  ];
  const recent = [...db.announcements].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5);
  return (
    <>
      <PageHeader title="Admin dashboard" desc="Live counts from stored data"
        action={<Button asChild><Link to="/app/manage/new">New announcement</Link></Button>} />
      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">{s.label}<s.icon className="h-4 w-4" /></div>
            <p className="mt-2 text-3xl font-bold text-primary">{s.value}</p>{s.sub && <p className="text-xs text-muted-foreground">{s.sub}</p>}
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border bg-card p-4">
          <h2 className="mb-3 font-semibold">Recently updated</h2>
          <ul className="divide-y">{recent.map((a) => (
            <li key={a.id} className="flex items-center justify-between gap-2 py-2 text-sm">
              <Link to="/app/notices/$id" params={{ id: a.id }} className="truncate hover:underline">{a.title}</Link><StatusBadge s={a.status} />
            </li>))}</ul>
        </section>
        <section className="rounded-lg border bg-card p-4">
          <div className="mb-3 flex items-center justify-between"><h2 className="font-semibold">Recent activity</h2><Link to="/app/activity" className="text-sm text-primary hover:underline">View all</Link></div>
          <ul className="divide-y">{db.activity.slice(0, 6).map((l) => (
            <li key={l.id} className="py-2 text-sm"><span className="font-medium">{db.users.find((u) => u.id === l.actorId)?.name ?? "Unknown"}</span> {l.action.toLowerCase()} — <span className="text-muted-foreground">{l.target}</span>
              <span className="block text-xs text-muted-foreground">{fmtDate(l.at)}</span></li>))}</ul>
        </section>
      </div>
    </>
  );
}