"use client";
import * as React from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CHANNEL_TYPES } from "@/lib/constants";
import { Download, ArrowRight, ArrowLeft, Check } from "lucide-react";

type CategoryOption = { id: number; name: string };

type FormState = {
  telegramUsername: string;
  title: string;
  description: string;
  language: string;
  type: (typeof CHANNEL_TYPES)[number];
  categoryId: string;
  inviteLink: string;
  websiteUrl: string;
  tags: string;
};

export function AddChannelWizard({
  categories,
  locales,
}: {
  categories: CategoryOption[];
  locales: string[];
}) {
  const t = useTranslations("dashboard");
  const tAuth = useTranslations("auth");
  const router = useRouter();
  const [step, setStep] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [fetching, setFetching] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<FormState>({
    telegramUsername: "",
    title: "",
    description: "",
    language: locales[0] ?? "en",
    type: "CHANNEL",
    categoryId: categories[0]?.id ? String(categories[0].id) : "",
    inviteLink: "",
    websiteUrl: "",
    tags: "",
  });

  const steps = [t("wizard_step1"), t("wizard_step2"), t("wizard_step3"), t("wizard_step4")];

  const update = <K extends keyof FormState>(k: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value as FormState[K] }));

  const fetchFromTelegram = async () => {
    if (!form.telegramUsername) return;
    setFetching(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/telegram/lookup?username=${encodeURIComponent(form.telegramUsername)}`,
      );
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.ok) {
        setForm((f) => ({
          ...f,
          title: data.title ?? f.title,
          description: data.description ?? f.description,
          type: data.type ?? f.type,
        }));
      } else {
        setError(data?.error ?? "Not found");
      }
    } finally {
      setFetching(false);
    }
  };

  const submit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/user/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telegramUsername: form.telegramUsername.replace(/^@/, ""),
          title: form.title,
          description: form.description,
          language: form.language,
          type: form.type,
          categoryId: form.categoryId ? Number(form.categoryId) : null,
          inviteLink: form.inviteLink || null,
          websiteUrl: form.websiteUrl || null,
          tags: form.tags
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? "Failed");
        return;
      }
      router.push("/dashboard/channels");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <ol className="flex flex-wrap items-center gap-2 text-sm">
        {steps.map((s, i) => (
          <li
            key={s}
            className={`flex items-center gap-2 rounded-full px-3 py-1 ${
              i === step
                ? "bg-primary text-primary-foreground"
                : i < step
                  ? "bg-muted text-muted-foreground"
                  : "bg-muted text-muted-foreground"
            }`}
          >
            {i < step ? <Check className="h-3.5 w-3.5" /> : <span>{i + 1}.</span>}
            {s}
          </li>
        ))}
      </ol>

      <Card>
        <CardHeader>
          <CardTitle>{steps[step]}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 0 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="username">{tAuth("telegramUsername")}</Label>
                <div className="flex gap-2">
                  <Input
                    id="username"
                    placeholder="@durov"
                    value={form.telegramUsername}
                    onChange={update("telegramUsername")}
                  />
                  <Button type="button" variant="outline" onClick={fetchFromTelegram} disabled={fetching}>
                    <Download className="mr-2 h-4 w-4" />
                    {t("fetchFromTelegram")}
                  </Button>
                </div>
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
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
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
                    value={form.categoryId}
                    onChange={update("categoryId")}
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
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input id="tags" value={form.tags} onChange={update("tags")} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="inviteLink">Invite link</Label>
                  <Input id="inviteLink" value={form.inviteLink} onChange={update("inviteLink")} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="websiteUrl">Website</Label>
                  <Input id="websiteUrl" value={form.websiteUrl} onChange={update("websiteUrl")} />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-2 text-sm">
              <Row label="Username" value={`@${form.telegramUsername.replace(/^@/, "")}`} />
              <Row label="Title" value={form.title} />
              <Row label="Type" value={form.type} />
              <Row label="Language" value={form.language.toUpperCase()} />
              <Row
                label="Category"
                value={categories.find((c) => String(c.id) === form.categoryId)?.name ?? "—"}
              />
              <Row label="Description" value={form.description || "—"} />
              <Row label="Tags" value={form.tags || "—"} />
            </div>
          )}

          {step === 3 && (
            <div className="rounded-md border bg-muted/30 p-4 text-sm text-muted-foreground">
              {t("submittedNotice")}
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex items-center justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0 || loading}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            {step < steps.length - 1 ? (
              <Button
                type="button"
                onClick={() => {
                  if (step === 0 && !form.telegramUsername) {
                    setError(tAuth("telegramUsername"));
                    return;
                  }
                  if (step === 1 && !form.title) {
                    setError("Title is required");
                    return;
                  }
                  setError(null);
                  setStep((s) => s + 1);
                }}
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button type="button" onClick={submit} disabled={loading}>
                {loading ? "..." : t("submitForReview")}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b py-2 last:border-b-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="min-w-0 flex-1 text-right font-medium">{value}</span>
    </div>
  );
}
