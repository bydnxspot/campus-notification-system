import { Navigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useSessionUser } from "@/lib/repository";
import { isAdminRole } from "@/lib/rules";
import type { User } from "@/lib/types";

/** Route guard: students (or anyone failing `allow`) are redirected to their dashboard. */
export function RequireRole({ allow = (u) => isAdminRole(u.role), children }: { allow?: (u: User) => boolean; children: (u: User) => ReactNode }) {
  const user = useSessionUser();
  if (!user) return <Navigate to="/" />;
  if (!allow(user)) return <Navigate to="/app" />;
  return <>{children(user)}</>;
}