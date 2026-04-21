"use client";
import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Defaults = {
  siteName: string;
  defaultLanguage: string;
  maintenanceMode: boolean;
  adsEnabled: boolean;
  maxChannelsPerUser: number;
  autoApproveMinMembers: number | null;
  analyticsId: string;
  bankTransferInfo: string;
  bannedWords: string;
};

export function SiteSettingsForm({ defaults }: { defaults: Defaults }) {
  const [form, setForm] = React.useState(defaults);
  const [loading, setLoading] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) setSaved(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="siteName">Site name</Label>
            <Input
              id="siteName"
              value={form.siteName}
              onChange={(e) => setForm((f) => ({ ...f, siteName: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="defaultLanguage">Default language</Label>
            <Input
              id="defaultLanguage"
              value={form.defaultLanguage}
              onChange={(e) => setForm((f) => ({ ...f, defaultLanguage: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="analyticsId">Analytics ID</Label>
            <Input
              id="analyticsId"
              value={form.analyticsId}
              onChange={(e) => setForm((f) => ({ ...f, analyticsId: e.target.value }))}
              placeholder="G-XXXXXXXX"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rules & limits</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="maxChannelsPerUser">Max channels / user</Label>
            <Input
              id="maxChannelsPerUser"
              type="number"
              min={1}
              value={form.maxChannelsPerUser}
              onChange={(e) => setForm((f) => ({ ...f, maxChannelsPerUser: Number(e.target.value) }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="autoApproveMinMembers">Auto-approve ≥ N members</Label>
            <Input
              id="autoApproveMinMembers"
              type="number"
              min={0}
              value={form.autoApproveMinMembers ?? ""}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  autoApproveMinMembers: e.target.value ? Number(e.target.value) : null,
                }))
              }
              placeholder="disabled"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bannedWords">Banned words (JSON array)</Label>
            <textarea
              id="bannedWords"
              rows={3}
              className="w-full rounded-md border border-input bg-background p-3 font-mono text-xs"
              value={form.bannedWords}
              onChange={(e) => setForm((f) => ({ ...f, bannedWords: e.target.value }))}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              id="maint"
              type="checkbox"
              className="h-4 w-4"
              checked={form.maintenanceMode}
              onChange={(e) => setForm((f) => ({ ...f, maintenanceMode: e.target.checked }))}
            />
            <Label htmlFor="maint" className="cursor-pointer">
              Maintenance mode
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="ads"
              type="checkbox"
              className="h-4 w-4"
              checked={form.adsEnabled}
              onChange={(e) => setForm((f) => ({ ...f, adsEnabled: e.target.checked }))}
            />
            <Label htmlFor="ads" className="cursor-pointer">
              Ads enabled
            </Label>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Bank transfer info (manual payments)</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            rows={3}
            className="w-full rounded-md border border-input bg-background p-3 text-sm"
            value={form.bankTransferInfo}
            onChange={(e) => setForm((f) => ({ ...f, bankTransferInfo: e.target.value }))}
            placeholder="IBAN / account details shown to users paying manually"
          />
        </CardContent>
      </Card>

      <div className="md:col-span-2 flex items-center gap-3">
        <Button type="submit" disabled={loading}>
          Save
        </Button>
        {saved && <p className="text-sm text-emerald-600 dark:text-emerald-400">Saved ✓</p>}
      </div>
    </form>
  );
}
