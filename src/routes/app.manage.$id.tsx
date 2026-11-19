import { pageHead } from "@/lib/page-head";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { AnnouncementForm } from "@/components/app/AnnouncementForm";
import { Empty, PageHeader } from "@/components/app/bits";
import { RequireRole } from "@/components/app/RequireStaff";
import { updateAnnouncement, useDb } from "@/lib/repository";
import { canEditAnnouncement } from "@/lib/rules";

export const Route = createFileRoute("/app/manage/$id")({ head: () => pageHead("Edit announcement", "Edit notice content, audience, dates and status."), component: Edit });
function Edit() {
  const { id } = Route.useParams(); const db = useDb(); const nav = useNavigate();
  const a = db.announcements.find((x) => x.id === id);
  return <RequireRole>{(u) => !a || !canEditAnnouncement(u, a) ? <Empty title="You cannot edit this announcement" /> : <><PageHeader title="Edit announcement" />
    <AnnouncementForm initial={a} authorName={u.name} onSubmit={(v) => { updateAnnouncement(u, a.id, v); toast.success("Saved"); nav({ to: "/app/manage" }); }} /></>}</RequireRole>;
}