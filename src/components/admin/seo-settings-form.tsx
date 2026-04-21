"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Defaults = {
  metaKeywords: string;
  metaDescription: string;
  siteDescription: string;
  socialLinks: string;
};

export function SeoSettingsForm({ defaults }: { defaults: Defaults }) {
  const [form, setForm] = React.useState(defaults);
  const [loading, setLoading] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    try {
      const res = await fetch("/api/admin/seo", {
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
    <form onSubmit={submit} className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Multi-lang SEO (JSON objects)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {(
            [
              ["siteDescription", "Site description { locale: string }"],
              ["metaDescription", "Meta description { locale: string }"],
              ["metaKeywords", "Meta keywords { locale: string[] }"],
              ["socialLinks", "Social links { twitter, telegram, github, ... }"],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="space-y-1.5">
              <Label htmlFor={key}>{label}</Label>
              <textarea
                id={key}
                rows={4}
                className="w-full rounded-md border border-input bg-background p-3 font-mono text-xs"
                value={form[key as keyof Defaults]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              />
            </div>
          ))}
        </CardContent>
      </Card>
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={loading}>
          Save
        </Button>
        {saved && <p className="text-sm text-emerald-600 dark:text-emerald-400">Saved ✓</p>}
      </div>
    </form>
  );
}
