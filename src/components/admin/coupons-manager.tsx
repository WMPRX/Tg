"use client";
import * as React from "react";
import { useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

type Coupon = {
  id: number;
  code: string;
  discountType: string;
  discountValue: number;
  usageLimit: number | null;
  usageCount: number;
  validUntil: string | null;
  isActive: boolean;
};

export function CouponsManager({ items }: { items: Coupon[] }) {
  const router = useRouter();
  const [code, setCode] = React.useState("");
  const [discountType, setDiscountType] = React.useState("PERCENT");
  const [discountValue, setDiscountValue] = React.useState("10");
  const [usageLimit, setUsageLimit] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/premium/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.toUpperCase(),
          discountType,
          discountValue: Number(discountValue),
          usageLimit: usageLimit ? Number(usageLimit) : null,
        }),
      });
      if (res.ok) {
        setCode("");
        setDiscountValue("10");
        setUsageLimit("");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  const toggle = async (id: number, isActive: boolean) => {
    await fetch(`/api/admin/premium/coupons/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    router.refresh();
  };

  return (
    <div className="grid gap-4 md:grid-cols-[1fr_300px]">
      <div className="overflow-hidden rounded-lg border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/30 text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-3 py-2">Code</th>
              <th className="px-3 py-2">Discount</th>
              <th className="px-3 py-2 text-right">Used</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2 text-right" />
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id} className="border-b last:border-b-0">
                <td className="px-3 py-2 font-mono">{c.code}</td>
                <td className="px-3 py-2">
                  {c.discountType === "PERCENT" ? `${c.discountValue}%` : `$${c.discountValue.toFixed(2)}`}
                </td>
                <td className="px-3 py-2 text-right text-xs">
                  {c.usageCount}
                  {c.usageLimit ? ` / ${c.usageLimit}` : ""}
                </td>
                <td className="px-3 py-2">
                  <Badge variant={c.isActive ? "default" : "outline"}>
                    {c.isActive ? "Active" : "Disabled"}
                  </Badge>
                </td>
                <td className="px-3 py-2 text-right">
                  <Button size="sm" variant="outline" onClick={() => toggle(c.id, c.isActive)}>
                    {c.isActive ? "Disable" : "Enable"}
                  </Button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-10 text-center text-muted-foreground">
                  No coupons yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <form onSubmit={create} className="space-y-3 rounded-lg border bg-muted/20 p-4">
        <h3 className="font-semibold">New coupon</h3>
        <div className="space-y-1.5">
          <Label htmlFor="c-code">Code</Label>
          <Input id="c-code" value={code} onChange={(e) => setCode(e.target.value)} required />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <Label htmlFor="c-type">Type</Label>
            <select
              id="c-type"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value)}
            >
              <option value="PERCENT">%</option>
              <option value="FIXED">Fixed</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="c-value">Value</Label>
            <Input
              id="c-value"
              type="number"
              min="0"
              step="0.01"
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="c-limit">Usage limit</Label>
          <Input
            id="c-limit"
            type="number"
            min="1"
            value={usageLimit}
            onChange={(e) => setUsageLimit(e.target.value)}
            placeholder="Unlimited"
          />
        </div>
        <Button type="submit" disabled={loading} className="w-full">
          Create
        </Button>
      </form>
    </div>
  );
}
