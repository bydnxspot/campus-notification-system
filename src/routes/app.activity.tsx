import { pageHead } from "@/lib/page-head";
import { createFileRoute } from "@tanstack/react-router";
import { Empty, PageHeader } from "@/components/app/bits";
import { RequireRole } from "@/components/app/RequireStaff";
import { useDb } from "@/lib/repository";

export const Route = createFileRoute("/app/activity")({ head: () => pageHead("Activity log", "Review announcement and account changes in this browser."), component: () => <RequireRole>{() => <Log />}</RequireRole> });
function Log() {
  const db = useDb();
  return <><PageHeader title="Activity log" />{!db.activity.length ? <Empty title="No activity yet" /> :
    <ul className="divide-y rounded-lg border bg-card">{db.activity.map((l) => <li key={l.id} className="p-3 text-sm">
      <span className="font-medium">{db.users.find((u) => u.id === l.actorId)?.name ?? "Unknown"}</span> — {l.action}: <span className="text-muted-foreground">{l.target}</span>
      <span className="block text-xs text-muted-foreground">{new Date(l.at).toLocaleString()}</span></li>)}</ul>}</>;
}