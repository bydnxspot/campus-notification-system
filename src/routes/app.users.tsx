import { pageHead } from "@/lib/page-head";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader, selectCls } from "@/components/app/bits";
import { RequireRole } from "@/components/app/RequireStaff";
import { updateUser, useDb } from "@/lib/repository";
import { canManageUsers } from "@/lib/rules";
import { FACULTIES, LEVELS, ROLES, ROLE_LABELS, type Role, type User } from "@/lib/types";

export const Route = createFileRoute("/app/users")({ head: () => pageHead("User management", "System Administrator demo controls for roles and activation."), component: () => <RequireRole allow={canManageUsers}>{(u) => <Users me={u} />}</RequireRole> });
function Users({ me }: { me: User }) {
  const db = useDb();
  const up = (id: string, p: Parameters<typeof updateUser>[2]) => { try { updateUser(me, id, p); toast.success("User updated"); } catch (e) { toast.error((e as Error).message); } };
  return <><PageHeader title="User management" />
    <div className="overflow-x-auto rounded-lg border bg-card"><table className="w-full text-sm">
      <thead className="bg-muted text-left"><tr><th className="p-3">User</th><th className="p-3">Role</th><th className="p-3">Faculty</th><th className="p-3">Department</th><th className="p-3">Level</th><th className="p-3">Status</th></tr></thead>
      <tbody className="divide-y">{db.users.map((u) => <tr key={u.id}>
        <td className="p-3"><p className="font-medium">{u.name}</p><p className="text-xs text-muted-foreground">{u.email}</p></td>
        <td className="p-3"><select aria-label="Role" className={selectCls} value={u.role} onChange={(e) => up(u.id, { role: e.target.value as Role })}>{ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}</select></td>
        <td className="p-3"><select aria-label="Faculty" className={selectCls} value={u.faculty ?? ""} onChange={(e) => up(u.id, { faculty: e.target.value || undefined })}><option value="">—</option>{Object.keys(FACULTIES).map((f) => <option key={f}>{f}</option>)}</select></td>
        <td className="p-3"><select aria-label="Department" className={selectCls} value={u.department ?? ""} onChange={(e) => up(u.id, { department: e.target.value || undefined })}><option value="">—</option>{Object.values(FACULTIES).flat().map((d) => <option key={d}>{d}</option>)}</select></td>
        <td className="p-3"><select aria-label="Level" className={selectCls} value={u.level ?? ""} onChange={(e) => up(u.id, { level: e.target.value || undefined })}><option value="">—</option>{LEVELS.map((l) => <option key={l}>{l}</option>)}</select></td>
        <td className="p-3"><Button size="sm" variant={u.active ? "outline" : "default"} onClick={() => up(u.id, { active: !u.active })}>{u.active ? "Deactivate" : "Activate"}</Button></td>
      </tr>)}</tbody></table></div></>;
}