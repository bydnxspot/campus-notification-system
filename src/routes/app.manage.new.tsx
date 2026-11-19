import { pageHead } from "@/lib/page-head";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { AnnouncementForm } from "@/components/app/AnnouncementForm";
import { PageHeader } from "@/components/app/bits";
import { RequireRole } from "@/components/app/RequireStaff";
import { createAnnouncement } from "@/lib/repository";

export const Route = createFileRoute("/app/manage/new")({ head: () => pageHead("New announcement", "Create and preview a targeted university announcement."), component: New });
function New() {
  const nav = useNavigate();
  return <RequireRole>{(u) => <><PageHeader title="New announcement" />
    <AnnouncementForm authorName={u.name} onSubmit={(v) => { createAnnouncement(u, v); toast.success(v.status === "published" ? "Published" : "Draft saved"); nav({ to: "/app/manage" }); }} /></>}</RequireRole>;
}