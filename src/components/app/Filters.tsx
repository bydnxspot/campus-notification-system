import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CATEGORIES, PRIORITIES, type Announcement } from "@/lib/types";
import { selectCls } from "./bits";

export interface FilterState { q: string; category: string; priority: string; from: string; to: string }
export const emptyFilters: FilterState = { q: "", category: "", priority: "", from: "", to: "" };
export function applyFilters(list: Announcement[], f: FilterState) {
  const q = f.q.trim().toLowerCase();
  return list.filter((a) =>
    (!q || a.title.toLowerCase().includes(q) || a.body.toLowerCase().includes(q)) &&
    (!f.category || a.category === f.category) && (!f.priority || a.priority === f.priority) &&
    (!f.from || a.publishDate >= f.from) && (!f.to || a.publishDate <= f.to));
}
export function Filters({ f, set }: { f: FilterState; set: (f: FilterState) => void }) {
  return (
    <div className="mb-4 grid gap-2 rounded-lg border bg-card p-3 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto]">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input aria-label="Search notices" placeholder="Search title or content…" className="pl-8" value={f.q} onChange={(e) => set({ ...f, q: e.target.value })} />
      </div>
      <select aria-label="Category" className={selectCls} value={f.category} onChange={(e) => set({ ...f, category: e.target.value })}>
        <option value="">All categories</option>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}
      </select>
      <select aria-label="Priority" className={selectCls} value={f.priority} onChange={(e) => set({ ...f, priority: e.target.value })}>
        <option value="">All priorities</option>{PRIORITIES.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
      </select>
      <Input aria-label="From date" type="date" value={f.from} onChange={(e) => set({ ...f, from: e.target.value })} />
      <Input aria-label="To date" type="date" value={f.to} onChange={(e) => set({ ...f, to: e.target.value })} />
      <Button variant="ghost" onClick={() => set(emptyFilters)}>Clear</Button>
    </div>
  );
}