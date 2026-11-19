import { pageHead } from "@/lib/page-head";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Empty, NoticeCard, PageHeader } from "@/components/app/bits";
import { Filters, applyFilters, emptyFilters } from "@/components/app/Filters";
import { useDb, useSessionUser } from "@/lib/repository";
import { isVisibleTo } from "@/lib/rules";

export const Route = createFileRoute("/app/notices/")({ head: () => pageHead("Notices", "Search current published notices relevant to your audience."), component: Notices });

function Notices() {
  const db = useDb(); const user = useSessionUser();
  const [f, setF] = useState(emptyFilters);
  if (!user) return null;
  const list = applyFilters(db.announcements.filter((a) => isVisibleTo(user, a)), f).sort((a, b) => b.publishDate.localeCompare(a.publishDate));
  return (
    <>
      <PageHeader title="Notices" desc="Published, current notices for your audience" />
      <Filters f={f} set={setF} />
      <p className="mb-3 text-sm text-muted-foreground">{list.length} result{list.length === 1 ? "" : "s"}</p>
      {list.length ? <div className="grid gap-3 md:grid-cols-2">{list.map((a) => <NoticeCard key={a.id} a={a} />)}</div>
        : <Empty title="No matching notices">Try clearing filters or a different search.</Empty>}
    </>
  );
}