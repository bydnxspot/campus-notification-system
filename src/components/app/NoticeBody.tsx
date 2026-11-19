import { Paperclip } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { audienceLabel } from "@/lib/rules";
import type { Announcement } from "@/lib/types";
import { PriorityBadge, fmtDate } from "./bits";

export function NoticeBody({ a, authorName }: { a: Announcement; authorName: string }) {
  return (
    <article>
      <div className="mb-3 flex flex-wrap gap-2"><Badge variant="outline">{a.category}</Badge><PriorityBadge p={a.priority} /></div>
      <h1 className="text-2xl font-bold text-foreground">{a.title || "Untitled"}</h1>
      <dl className="my-4 grid grid-cols-2 gap-3 rounded-md bg-muted p-4 text-sm sm:grid-cols-4">
        <div><dt className="text-muted-foreground">Author</dt><dd className="font-medium">{authorName}</dd></div>
        <div><dt className="text-muted-foreground">Published</dt><dd className="font-medium">{a.publishDate ? fmtDate(a.publishDate) : "—"}</dd></div>
        <div><dt className="text-muted-foreground">Expires</dt><dd className="font-medium">{a.expiryDate ? fmtDate(a.expiryDate) : "No expiry"}</dd></div>
        <div><dt className="text-muted-foreground">Audience</dt><dd className="font-medium">{audienceLabel(a.audience)}</dd></div>
      </dl>
      <div className="whitespace-pre-wrap leading-relaxed text-foreground">{a.body}</div>
      {a.attachment && (
        <div className="mt-6 flex items-center gap-3 rounded-md border p-3 text-sm">
          <Paperclip className="h-4 w-4 text-primary" />
          <div><p className="font-medium">{a.attachment.name}</p><p className="text-xs text-muted-foreground">{a.attachment.sizeKb} KB · {a.attachment.type} · metadata only (no file stored in demo)</p></div>
        </div>
      )}
    </article>
  );
}