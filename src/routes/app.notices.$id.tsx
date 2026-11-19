import { pageHead } from "@/lib/page-head";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Empty, StatusBadge } from "@/components/app/bits";
import { NoticeBody } from "@/components/app/NoticeBody";
import { markRead, useDb, useSessionUser } from "@/lib/repository";
import { canEditAnnouncement, isAdminRole, isVisibleTo } from "@/lib/rules";

export const Route = createFileRoute("/app/notices/$id")({ head: () => pageHead("Notice details", "Read an announcement with author, dates and attachment metadata."), component: Detail });

function Detail() {
  const { id } = Route.useParams(); const db = useDb(); const user = useSessionUser();
  const a = db.announcements.find((x) => x.id === id);
  const allowed = user && a && (isAdminRole(user.role) || isVisibleTo(user, a));
  const notif = db.notifications.find((n) => n.userId === user?.id && n.announcementId === id && !n.read);
  useEffect(() => { if (user && allowed && notif) markRead(user.id, notif.id); }, [allowed, notif, user?.id]);
  if (!user) return null;
  if (!a || !allowed) return <Empty title="Notice not available">It may have been removed, expired, or is not addressed to you. <Link to="/app/notices" className="text-primary underline">Back to notices</Link></Empty>;
  const author = db.users.find((u) => u.id === a.authorId);
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex items-center justify-between">
        <Button asChild variant="ghost" size="sm"><Link to="/app/notices"><ArrowLeft className="mr-1 h-4 w-4" />Back</Link></Button>
        <div className="flex items-center gap-2">{isAdminRole(user.role) && <StatusBadge s={a.status} />}
          {canEditAnnouncement(user, a) && <Button asChild size="sm" variant="outline"><Link to="/app/manage/$id" params={{ id: a.id }}>Edit</Link></Button>}</div>
      </div>
      <div className="rounded-lg border bg-card p-6"><NoticeBody a={a} authorName={author ? `${author.name} (${author.role === "student" ? "Student" : author.role.replace("_", " ")})` : "Unknown"} /></div>
    </div>
  );
}