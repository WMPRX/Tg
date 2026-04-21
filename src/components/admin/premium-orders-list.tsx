"use client";
import * as React from "react";
import { useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ORDER_STATUSES } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

type Order = {
  id: number;
  orderNumber: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  createdAt: string;
  user: { id: number; name: string; email: string; username: string };
  channel: { id: number; username: string; title: string };
  plan: { name: string; durationDays: number };
};

export function PremiumOrdersList({ orders }: { orders: Order[] }) {
  const router = useRouter();
  const [busy, setBusy] = React.useState<number | null>(null);

  const setStatus = async (id: number, status: string) => {
    setBusy(id);
    try {
      const res = await fetch(`/api/admin/premium/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) router.refresh();
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="overflow-hidden rounded-lg border">
      <table className="w-full text-sm">
        <thead className="border-b bg-muted/30 text-left text-xs uppercase text-muted-foreground">
          <tr>
            <th className="px-3 py-2">Order</th>
            <th className="px-3 py-2">User / Channel</th>
            <th className="px-3 py-2">Plan</th>
            <th className="px-3 py-2 text-right">Amount</th>
            <th className="px-3 py-2">Method</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2 text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="border-b last:border-b-0">
              <td className="px-3 py-2 font-mono text-xs">
                #{o.orderNumber}
                <div className="text-muted-foreground">{new Date(o.createdAt).toLocaleDateString()}</div>
              </td>
              <td className="px-3 py-2">
                <div>{o.user.name}</div>
                <div className="text-xs text-muted-foreground">@{o.channel.username}</div>
              </td>
              <td className="px-3 py-2">
                {o.plan.name}
                <div className="text-xs text-muted-foreground">{o.plan.durationDays}d</div>
              </td>
              <td className="px-3 py-2 text-right tabular-nums">
                {formatCurrency(o.amount, o.currency)}
              </td>
              <td className="px-3 py-2 text-xs">{o.paymentMethod}</td>
              <td className="px-3 py-2">
                <Badge
                  variant={
                    o.status === "ACTIVE" || o.status === "PAID"
                      ? "default"
                      : o.status === "CANCELLED" || o.status === "REFUNDED"
                        ? "destructive"
                        : "secondary"
                  }
                >
                  {o.status}
                </Badge>
              </td>
              <td className="px-3 py-2 text-right">
                <select
                  className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                  value={o.status}
                  onChange={(e) => setStatus(o.id, e.target.value)}
                  disabled={busy === o.id}
                >
                  {ORDER_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
          {orders.length === 0 && (
            <tr>
              <td colSpan={7} className="px-3 py-12 text-center text-muted-foreground">
                No orders yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
