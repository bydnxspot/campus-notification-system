import { Link } from "@tanstack/react-router";
import { CalendarDays, Paperclip, Users } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { audienceLabel } from "@/lib/rules";
import type { Announcement, Priority, Status } from "@/lib/types";

export function PriorityBadge({ p }: { p: Priority }) {
  if (p === "urgent") return <Badge variant="destructive">Urgent</Badge>;
  if (p === "important") return <Badge variant="warning">Important</Badge>;
  return <Badge variant="muted">Normal</Badge>;
}
export function StatusBadge({ s }: { s: Status }) {
  if (s === "published") return <Badge variant="success">Published</Badge>;
  if (s === "draft") return <Badge variant="secondary">Draft</Badge>;
  return <Badge variant="muted">Archived</Badge>;
}
export const fmtDate = (d: string) => new Date(d.length === 10 ? d + "T00:00:00" : d).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

export function NoticeCard({ a, unread }: { a: Announcement; unread?: boolean }) {
  return (
    <Link to="/app/notices/$id" params={{ id: a.id }}
      className="block rounded-lg border bg-card p-4 transition-colors hover:border-ring focus-visible:outline-2 focus-visible:outline-ring">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <Badge variant="outline">{a.category}</Badge>
        <PriorityBadge p={a.priority} />
        {unread && <Badge>New</Badge>}
      </div>
      <h3 className="font-semibold leading-snug text-foreground">{a.title}</h3>
      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{a.body}</p>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />{fmtDate(a.publishDate)}</span>
        <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{audienceLabel(a.audience)}</span>
        {a.attachment && <span className="flex items-center gap-1"><Paperclip className="h-3.5 w-3.5" />{a.attachment.name}</span>}
      </div>
    </Link>
  );
}
export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed bg-card p-10 text-center">
      <p className="font-medium">{title}</p>
      {children && <div className="mt-1 text-sm text-muted-foreground">{children}</div>}
    </div>
  );
}
export function PageHeader({ title, desc, action }: { title: string; desc?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div><h1 className="text-2xl font-bold text-foreground">{title}</h1>{desc && <p className="text-sm text-muted-foreground">{desc}</p>}</div>
      {action}
    </div>
  );
}
export const selectCls = "h-9 rounded-md border border-input bg-card px-3 text-sm focus-visible:outline-2 focus-visible:outline-ring";