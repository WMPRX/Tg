"use client";
import * as React from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type Defaults = {
  name: string;
  email: string;
  username: string;
  telegramUsername: string;
  bio: string;
};

export function SettingsForm({ defaults }: { defaults: Defaults }) {
  const tAuth = useTranslations("auth");
  const tCommon = useTranslations("common");
  const [form, setForm] = React.useState(defaults);
  const [loading, setLoading] = React.useState(false);
  const [status, setStatus] = React.useState<"idle" | "saved" | "error">("idle");

  const update =
    (k: keyof Defaults) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus("idle");
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          telegramUsername: form.telegramUsername || null,
          bio: form.bio || null,
        }),
      });
      setStatus(res.ok ? "saved" : "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="max-w-xl space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">{tAuth("name")}</Label>
        <Input id="name" value={form.name} onChange={update("name")} required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">{tAuth("email")}</Label>
        <Input id="email" value={form.email} disabled />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="username">{tAuth("username")}</Label>
        <Input id="username" value={form.username} disabled />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="telegramUsername">{tAuth("telegramUsername")}</Label>
        <Input
          id="telegramUsername"
          value={form.telegramUsername}
          onChange={update("telegramUsername")}
          placeholder="@durov"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="bio">Bio</Label>
        <textarea
          id="bio"
          rows={3}
          className="w-full rounded-md border border-input bg-background p-3 text-sm"
          value={form.bio}
          onChange={update("bio")}
        />
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={loading}>
          {tCommon("save")}
        </Button>
        {status === "saved" && (
          <p className="text-sm text-emerald-600 dark:text-emerald-400">✓</p>
        )}
        {status === "error" && <p className="text-sm text-destructive">Error</p>}
      </div>
    </form>
  );
}
