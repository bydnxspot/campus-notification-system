import { pageHead } from "@/lib/page-head";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Empty, PageHeader, PriorityBadge, fmtDate } from "@/components/app/bits";
import { markRead, useDb, useSessionUser } from "@/lib/repository";
import { isVisibleTo } from "@/lib/rules";

export const Route = createFileRoute("/app/notifications")({ head: () => pageHead("Notifications", "Read relevant notice alerts and manage unread notifications."), component: Notifs });

function Notifs() {
  const db = useDb(); const user = useSessionUser();
  if (!user) return null;
  const list = db.notifications.filter((n) => n.userId === user.id)
    .flatMap((n) => {
      const a = db.announcements.find((a) => a.id === n.announcementId);
      return a && isVisibleTo(user, a) ? [{ n, a }] : [];
    });
  const unread = list.filter((x) => !x.n.read).length;
  return (
    <>
      <PageHeader title="Notifications" desc={`${unread} unread`}
        action={<Button variant="outline" disabled={!unread} onClick={() => { markRead(user.id); toast.success("All marked as read"); }}>Mark all as read</Button>} />
      {list.length === 0 ? <Empty title="No notifications yet">You'll be notified here when a relevant notice is published.</Empty> : (
        <ul className="divide-y rounded-lg border bg-card">{list.map(({ n, a }) => (
          <li key={n.id} className={`flex flex-wrap items-center gap-3 p-4 ${n.read ? "" : "bg-accent/40"}`}>
            {!n.read && <span aria-label="Unread" className="h-2 w-2 rounded-full bg-primary" />}
            <div className="min-w-0 flex-1">
              <Link to="/app/notices/$id" params={{ id: a.id }} className={`hover:underline ${n.read ? "" : "font-semibold"}`}>{a.title}</Link>
              <p className="text-xs text-muted-foreground">{a.category} · {fmtDate(n.createdAt)}</p>
            </div>
            <PriorityBadge p={a.priority} />
            {!n.read && <Button size="sm" variant="ghost" onClick={() => markRead(user.id, n.id)}>Mark as read</Button>}
          </li>))}</ul>)}
    </>
  );
}