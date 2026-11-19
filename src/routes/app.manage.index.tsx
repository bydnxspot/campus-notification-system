import { pageHead } from "@/lib/page-head";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Empty, PageHeader, PriorityBadge, StatusBadge, fmtDate, selectCls } from "@/components/app/bits";
import { Filters, applyFilters, emptyFilters } from "@/components/app/Filters";
import { RequireRole } from "@/components/app/RequireStaff";
import { deleteAnnouncement, setStatus, useDb } from "@/lib/repository";
import { canEditAnnouncement } from "@/lib/rules";
import type { Status, User } from "@/lib/types";

export const Route = createFileRoute("/app/manage/")({ head: () => pageHead("Manage announcements", "Manage university announcement drafts, publications and archives."), component: () => <RequireRole>{(u) => <Manage user={u} />}</RequireRole> });

function Manage({ user }: { user: User }) {
  const db = useDb(); const [f, setF] = useState(emptyFilters); const [st, setSt] = useState("");
  const [del, setDel] = useState<string | null>(null);
  const run = (fn: () => void, msg: string) => { try { fn(); toast.success(msg); } catch (e) { toast.error((e as Error).message); } };
  const list = applyFilters(db.announcements, f).filter((a) => !st || a.status === st);
  const act = (id: string, s: Status, msg: string) => run(() => setStatus(user, id, s), msg);
  return (
    <>
      <PageHeader title="Manage announcements" action={<Button asChild><Link to="/app/manage/new">New announcement</Link></Button>} />
      <Filters f={f} set={setF} />
      <select aria-label="Status" className={`${selectCls} mb-3`} value={st} onChange={(e) => setSt(e.target.value)}>
        <option value="">All statuses</option><option value="published">Published</option><option value="draft">Draft</option><option value="archived">Archived</option></select>
      {!list.length ? <Empty title="No announcements match" /> : (
        <div className="overflow-x-auto rounded-lg border bg-card"><table className="w-full text-sm">
          <thead className="bg-muted text-left"><tr><th className="p-3">Title</th><th className="p-3">Category</th><th className="p-3">Priority</th><th className="p-3">Date</th><th className="p-3">Status</th><th className="p-3">Actions</th></tr></thead>
          <tbody className="divide-y">{list.map((a) => { const own = canEditAnnouncement(user, a); return (
            <tr key={a.id}><td className="p-3"><Link to="/app/notices/$id" params={{ id: a.id }} className="font-medium hover:underline">{a.title}</Link></td>
              <td className="p-3">{a.category}</td><td className="p-3"><PriorityBadge p={a.priority} /></td><td className="p-3">{fmtDate(a.publishDate)}</td><td className="p-3"><StatusBadge s={a.status} /></td>
              <td className="p-3">{own ? <div className="flex flex-wrap gap-1">
                <Button asChild size="sm" variant="outline"><Link to="/app/manage/$id" params={{ id: a.id }}>Edit</Link></Button>
                {a.status === "draft" && <Button size="sm" onClick={() => act(a.id, "published", "Published")}>Publish</Button>}
                {a.status === "published" && <Button size="sm" variant="secondary" onClick={() => act(a.id, "draft", "Unpublished")}>Unpublish</Button>}
                {a.status !== "archived" ? <Button size="sm" variant="ghost" onClick={() => act(a.id, "archived", "Archived")}>Archive</Button>
                  : <Button size="sm" variant="ghost" onClick={() => act(a.id, "draft", "Restored as draft")}>Restore</Button>}
                <Button size="sm" variant="destructive" onClick={() => setDel(a.id)}>Delete</Button></div>
                : <span className="text-xs text-muted-foreground">View only</span>}</td></tr>); })}</tbody></table></div>)}
      <AlertDialog open={!!del} onOpenChange={(o) => !o && setDel(null)}><AlertDialogContent>
        <AlertDialogHeader><AlertDialogTitle>Delete announcement?</AlertDialogTitle><AlertDialogDescription>This permanently removes it and its notifications.</AlertDialogDescription></AlertDialogHeader>
        <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => { const id = del; if (!id) return; setDel(null); run(() => deleteAnnouncement(user, id), "Deleted"); }}>Delete</AlertDialogAction></AlertDialogFooter>
      </AlertDialogContent></AlertDialog>
    </>
  );
}