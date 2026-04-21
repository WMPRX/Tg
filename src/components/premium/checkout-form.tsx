"use client";
import * as React from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PAYMENT_METHODS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

type Plan = {
  id: number;
  slug: string;
  name: string;
  price: number;
  currency: string;
  durationDays: number;
};

const METHOD_LABELS: Record<(typeof PAYMENT_METHODS)[number], string> = {
  STRIPE: "Credit Card (Stripe)",
  PAYPAL: "PayPal",
  CRYPTO: "Crypto (BTC/USDT)",
  BANK_TRANSFER: "Bank Transfer",
  PAPARA: "Papara",
  MANUAL: "Manual (Contact Admin)",
};

export function CheckoutForm({
  plan,
  channels,
}: {
  plan: Plan;
  channels: { id: number; username: string; title: string }[];
}) {
  const t = useTranslations("premium");
  const router = useRouter();
  const [channelId, setChannelId] = React.useState(channels[0]?.id ? String(channels[0].id) : "");
  const [method, setMethod] = React.useState<(typeof PAYMENT_METHODS)[number]>("MANUAL");
  const [couponCode, setCouponCode] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [created, setCreated] = React.useState<{ orderNumber: string } | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!channelId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/user/premium/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: plan.id,
          channelId: Number(channelId),
          paymentMethod: method,
          couponCode: couponCode || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? "Failed");
        return;
      }
      setCreated({ orderNumber: data.orderNumber });
      setTimeout(() => router.push("/dashboard/premium"), 2500);
    } finally {
      setLoading(false);
    }
  };

  if (channels.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
        Add a channel first before purchasing a Premium plan.
      </div>
    );
  }

  if (created) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-200">
        <h2 className="text-lg font-semibold">Order created ✓</h2>
        <p className="mt-2 text-sm">
          Order #<span className="font-mono">{created.orderNumber}</span> is pending payment confirmation.
          Redirecting…
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6 md:grid-cols-[1fr_300px]">
      <Card>
        <CardHeader>
          <CardTitle>{t("buyNow")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="channel">Channel</Label>
            <select
              id="channel"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={channelId}
              onChange={(e) => setChannelId(e.target.value)}
              required
            >
              {channels.map((c) => (
                <option key={c.id} value={c.id}>
                  @{c.username} — {c.title}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="method">Payment method</Label>
            <select
              id="method"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={method}
              onChange={(e) => setMethod(e.target.value as (typeof PAYMENT_METHODS)[number])}
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {METHOD_LABELS[m]}
                </option>
              ))}
            </select>
            {method !== "MANUAL" && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                {method} integration is stubbed — order will be placed but payment capture is pending.
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="coupon">Coupon code</Label>
            <Input
              id="coupon"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="WELCOME10"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>

      <Card className="self-start">
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Plan</span>
            <span className="font-medium">{plan.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Duration</span>
            <span className="font-medium">{plan.durationDays}d</span>
          </div>
          <div className="flex justify-between border-t pt-3">
            <span className="text-muted-foreground">Total</span>
            <span className="text-lg font-bold">{formatCurrency(plan.price, plan.currency)}</span>
          </div>
          <Button type="submit" variant="premium" className="w-full" disabled={loading}>
            {loading ? "..." : t("buyNow")}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
