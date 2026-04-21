"use client";
import * as React from "react";
import { useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { USER_ROLES, type UserRole } from "@/lib/constants";

type User = {
  id: number;
  name: string;
  email: string;
  username: string;
  role: string;
  isBanned: boolean;
  isActive: boolean;
  createdAt: string;
};

export function UsersManager({ users, currentRole }: { users: User[]; currentRole: UserRole }) {
  const router = useRouter();
  const [busy, setBusy] = React.useState<number | null>(null);

  const patch = async (id: number, data: Record<string, unknown>) => {
    setBusy(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) router.refresh();
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border">
      <table className="w-full text-sm">
        <thead className="border-b bg-muted/30 text-left text-xs uppercase text-muted-foreground">
          <tr>
            <th className="px-4 py-3">User</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Joined</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b last:border-b-0">
              <td className="px-4 py-3">
                <div className="font-medium">{u.name}</div>
                <div className="text-xs text-muted-foreground">
                  {u.email} · @{u.username}
                </div>
              </td>
              <td className="px-4 py-3">
                {currentRole === "SUPER_ADMIN" ? (
                  <select
                    className="h-8 rounded-md border border-input bg-background px-2 text-sm"
                    value={u.role}
                    onChange={(e) => patch(u.id, { role: e.target.value })}
                    disabled={busy === u.id}
                  >
                    {USER_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Badge variant="secondary">{u.role}</Badge>
                )}
              </td>
              <td className="px-4 py-3">
                {u.isBanned ? (
                  <Badge variant="destructive">Banned</Badge>
                ) : u.isActive ? (
                  <Badge>Active</Badge>
                ) : (
                  <Badge variant="outline">Inactive</Badge>
                )}
              </td>
              <td className="px-4 py-3 text-xs text-muted-foreground">
                {new Date(u.createdAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-right">
                <Button
                  size="sm"
                  variant={u.isBanned ? "outline" : "destructive"}
                  disabled={busy === u.id}
                  onClick={() => patch(u.id, { isBanned: !u.isBanned })}
                >
                  {u.isBanned ? "Unban" : "Ban"}
                </Button>
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                No users.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
