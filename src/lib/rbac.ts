import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { USER_ROLES, type UserRole } from "@/lib/constants";

export type SessionUser = {
  id: string;
  email?: string | null;
  name?: string | null;
  username?: string;
  role: UserRole;
};

export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const u = session.user as typeof session.user & { id?: string; role?: string; username?: string };
  if (!u.id) return null;
  return {
    id: u.id,
    email: u.email ?? null,
    name: u.name ?? null,
    username: u.username,
    role: (USER_ROLES as readonly string[]).includes(u.role ?? "") ? ((u.role ?? "USER") as UserRole) : "USER",
  };
}

export function isAdmin(role: UserRole): boolean {
  return role === "SUPER_ADMIN" || role === "ADMIN";
}

export function isStaff(role: UserRole): boolean {
  return isAdmin(role) || role === "EDITOR";
}
