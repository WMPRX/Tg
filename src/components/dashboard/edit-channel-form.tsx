"use client";
import * as React from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CHANNEL_TYPES } from "@/lib/constants";

type Channel = {
  id: number;
  username: string;
  title: string;
  description: string;
  type: string;
  language: string;
  categoryId: number | null;
  inviteLink: string;
  websiteUrl: string;
};

export function EditChannelForm({
  channel,
  categories,
  locales,
}: {
  channel: Channel;
  categories: { id: number; name: string }[];
  locales: string[];
}) {
  const t = useTranslations("dashboard");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [form, setForm] = React.useState(channel);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const update =
    (k: keyof Channel) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/user/channels/${form.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description || null,
          type: form.type,
          language: form.language,
          categoryId: form.categoryId ? Number(form.categoryId) : null,
          inviteLink: form.inviteLink || null,
          websiteUrl: form.websiteUrl || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error ?? "Failed");
        return;
      }
      router.push("/dashboard/channels");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    if (!confirm("Are you sure?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/user/channels/${form.id}`, { method: "DELETE" });
      if (res.ok) router.push("/dashboard/channels");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-4">
      <div className="space-y-1.5">
        <Label>Username</Label>
        <Input value={`@${form.username}`} disabled />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="type">Type</Label>
          <select
            id="type"
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={form.type}
            onChange={update("type")}
          >
            {CHANNEL_TYPES.map((tt) => (
              <option key={tt} value={tt}>
                {tt}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="language">Language</Label>
          <select
            id="language"
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={form.language}
            onChange={update("language")}
          >
            {locales.map((l) => (
              <option key={l} value={l}>
                {l.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="title">Title</Label>
        <Input id="title" value={form.title} onChange={update("title")} required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          rows={4}
          className="w-full rounded-md border border-input bg-background p-3 text-sm"
          value={form.description}
          onChange={update("description")}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={form.categoryId ?? ""}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                categoryId: e.target.value ? Number(e.target.value) : null,
              }))
            }
          >
            <option value="">—</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="inviteLink">Invite link</Label>
          <Input id="inviteLink" value={form.inviteLink} onChange={update("inviteLink")} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="websiteUrl">Website</Label>
        <Input id="websiteUrl" value={form.websiteUrl} onChange={update("websiteUrl")} />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={loading}>
          {tCommon("save")}
        </Button>
        <Button type="button" variant="destructive" onClick={onDelete} disabled={loading}>
          {t("delete")}
        </Button>
      </div>
    </form>
  );
}
