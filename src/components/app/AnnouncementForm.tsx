import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CATEGORIES, FACULTIES, LEVELS, PRIORITIES, type Announcement, type Category, type Priority, type Status } from "@/lib/types";
import type { AnnouncementInput } from "@/lib/repository";
import { today } from "@/lib/rules";
import { NoticeBody } from "./NoticeBody";
import { selectCls } from "./bits";

const DEPTS = Object.values(FACULTIES).flat();
export function validate(v: AnnouncementInput): Record<string, string> {
  const e: Record<string, string> = {};
  if (v.title.trim().length < 5) e["title"] = "Title must be at least 5 characters.";
  if (v.title.length > 150) e["title"] = "Title must be under 150 characters.";
  if (v.body.trim().length < 20) e["body"] = "Body must be at least 20 characters.";
  if (!v.publishDate) e["publishDate"] = "Publication date is required.";
  if (v.expiryDate && v.expiryDate < v.publishDate) e["expiryDate"] = "Expiry must be on or after the publication date.";
  const a = v.audience;
  if (a.scope === "faculty" && !a.faculty) e["audience"] = "Choose a faculty.";
  if (a.scope === "department" && !a.department) e["audience"] = "Choose a department.";
  if (a.scope === "level" && !a.level) e["audience"] = "Choose a level.";
  if (v.attachment && !v.attachment.name.trim()) e["attachment"] = "Attachment needs a file name.";
  return e;
}

export function AnnouncementForm({ initial, onSubmit, authorName }: { initial?: Announcement; authorName: string; onSubmit: (v: AnnouncementInput) => void }) {
  const [v, setV] = useState<AnnouncementInput>(() => initial
    ? { title: initial.title, body: initial.body, category: initial.category, priority: initial.priority, publishDate: initial.publishDate,
        expiryDate: initial.expiryDate, audience: initial.audience, status: initial.status, attachment: initial.attachment }
    : { title: "", body: "", category: "Academic", priority: "normal", publishDate: today(), audience: { scope: "all" }, status: "draft" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [preview, setPreview] = useState(false);
  const set = (p: Partial<AnnouncementInput>) => setV((x) => ({ ...x, ...p }));
  const submit = (status: Status) => {
    const next = { ...v, status, expiryDate: v.expiryDate || undefined };
    const e = validate(next); setErrors(e);
    if (Object.keys(e).length === 0) {
      try { onSubmit(next); }
      catch (error) { setErrors({ submit: error instanceof Error ? error.message : "Unable to save announcement." }); }
    }
  };
  const err = (k: string) => errors[k] && <p className="text-xs text-destructive">{errors[k]}</p>;

  return (
    <form className="grid gap-5 rounded-lg border bg-card p-5" onSubmit={(e) => { e.preventDefault(); submit(v.status === "archived" ? "draft" : v.status); }} noValidate>
      <div className="grid gap-1.5"><Label htmlFor="title">Title *</Label>
        <Input id="title" value={v.title} onChange={(e) => set({ title: e.target.value })} aria-invalid={!!errors["title"]} />{err("title")}</div>
      <div className="grid gap-1.5"><Label htmlFor="body">Body *</Label>
        <Textarea id="body" rows={7} value={v.body} onChange={(e) => set({ body: e.target.value })} aria-invalid={!!errors["body"]} />{err("body")}</div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5"><Label htmlFor="cat">Category</Label>
          <select id="cat" className={selectCls} value={v.category} onChange={(e) => set({ category: e.target.value as Category })}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></div>
        <div className="grid gap-1.5"><Label htmlFor="pri">Priority</Label>
          <select id="pri" className={selectCls} value={v.priority} onChange={(e) => set({ priority: e.target.value as Priority })}>
            {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}</select></div>
        <div className="grid gap-1.5"><Label htmlFor="pub">Publication date *</Label>
          <Input id="pub" type="date" value={v.publishDate} onChange={(e) => set({ publishDate: e.target.value })} />{err("publishDate")}</div>
        <div className="grid gap-1.5"><Label htmlFor="exp">Expiry date (optional)</Label>
          <Input id="exp" type="date" value={v.expiryDate ?? ""} onChange={(e) => set({ expiryDate: e.target.value })} />{err("expiryDate")}</div>
      </div>
      <fieldset className="grid gap-3 rounded-md border p-4">
        <legend className="px-1 text-sm font-medium">Target audience</legend>
        <select aria-label="Audience scope" className={selectCls} value={v.audience.scope}
          onChange={(e) => set({ audience: { scope: e.target.value as AnnouncementInput["audience"]["scope"] } })}>
          <option value="all">All university</option><option value="faculty">Faculty</option>
          <option value="department">Department</option><option value="level">Level</option>
        </select>
        {v.audience.scope === "faculty" && <select aria-label="Faculty" className={selectCls} value={v.audience.faculty ?? ""}
          onChange={(e) => set({ audience: { ...v.audience, faculty: e.target.value } })}>
          <option value="">Select faculty…</option>{Object.keys(FACULTIES).map((f) => <option key={f}>{f}</option>)}</select>}
        {(v.audience.scope === "department" || v.audience.scope === "level") && <select aria-label="Department" className={selectCls} value={v.audience.department ?? ""}
          onChange={(e) => set({ audience: { ...v.audience, department: e.target.value || undefined } })}>
          <option value="">{v.audience.scope === "level" ? "Any department" : "Select department…"}</option>{DEPTS.map((d) => <option key={d}>{d}</option>)}</select>}
        {v.audience.scope === "level" && <select aria-label="Level" className={selectCls} value={v.audience.level ?? ""}
          onChange={(e) => set({ audience: { ...v.audience, level: e.target.value } })}>
          <option value="">Select level…</option>{LEVELS.map((l) => <option key={l} value={l}>{l} Level</option>)}</select>}
        {err("audience")}
      </fieldset>
      <fieldset className="grid gap-3 rounded-md border p-4">
        <legend className="px-1 text-sm font-medium">Attachment metadata (optional)</legend>
        <p className="text-xs text-muted-foreground">Only file details are stored in this demo; the file itself is not uploaded.</p>
        {v.attachment ? (
          <div className="grid gap-2 sm:grid-cols-[2fr_1fr_auto]">
            <Input aria-label="File name" placeholder="file-name.pdf" value={v.attachment.name} onChange={(e) => { if (v.attachment) set({ attachment: { ...v.attachment, name: e.target.value } }); }} />
            <Input aria-label="Size in KB" type="number" min={0} value={v.attachment.sizeKb} onChange={(e) => { if (v.attachment) set({ attachment: { ...v.attachment, sizeKb: Number(e.target.value) } }); }} />
            <Button type="button" variant="ghost" onClick={() => set({ attachment: undefined })}>Remove</Button>
          </div>
        ) : (
          <Input type="file" aria-label="Choose file" onChange={(e) => { const f = e.target.files?.[0]; if (f) set({ attachment: { name: f.name, sizeKb: Math.ceil(f.size / 1024), type: f.type || "unknown" } }); }} />
        )}
        {err("attachment")}
      </fieldset>
      {err("submit")}
      <div className="flex flex-wrap justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => setPreview(true)}>Preview</Button>
        <Button type="button" variant="secondary" onClick={() => submit("draft")}>Save as draft</Button>
        <Button type="button" onClick={() => submit("published")}>Publish</Button>
      </div>
      <Dialog open={preview} onOpenChange={setPreview}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          <DialogHeader><DialogTitle>Preview</DialogTitle></DialogHeader>
          <NoticeBody a={{ ...v, id: "preview", authorId: "", createdAt: "", updatedAt: "" }} authorName={authorName} />
        </DialogContent>
      </Dialog>
    </form>
  );
}