"use client";
import * as React from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { localize } from "@/lib/utils";

type Submission = {
  id: number;
  telegramUsername: string;
  title: string;
  description: string;
  type: string;
  language: string;
  status: string;
  category: string | null;
  user: { id: number; name: string; email: string; username: string };
  createdAt: string;
};

export function SubmissionReviewList({
  submissions,
  locale,
}: {
  submissions: Submission[];
  locale: string;
}) {
  const t = useTranslations("admin");
  const router = useRouter();
  const [busyId, setBusyId] = React.useState<number | null>(null);

  const act = async (id: number, action: "approve" | "reject" | "revision") => {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/submissions/${id}/${action}`, { method: "POST" });
      if (res.ok) router.refresh();
    } finally {
      setBusyId(null);
    }
  };

  if (submissions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
        No submissions.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {submissions.map((s) => (
        <Card key={s.id}>
          <CardHeader className="flex flex-row items-start justify-between gap-3 pb-3">
            <div className="min-w-0">
              <CardTitle className="text-base">
                {s.title || `@${s.telegramUsername}`}{" "}
                <span className="text-sm font-normal text-muted-foreground">@{s.telegramUsername}</span>
              </CardTitle>
              <div className="mt-1 text-xs text-muted-foreground">
                by {s.user.name} (@{s.user.username}) — {new Date(s.createdAt).toLocaleString()}
              </div>
            </div>
            <Badge variant="secondary">{s.status}</Badge>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span>Type: {s.type}</span>
              <span>· Lang: {s.language.toUpperCase()}</span>
              {s.category && <span>· Cat: {localize(s.category, locale)}</span>}
            </div>
            {s.description && (
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">{s.description}</p>
            )}
            {s.status === "PENDING" && (
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <Button
                  size="sm"
                  onClick={() => act(s.id, "approve")}
                  disabled={busyId === s.id}
                >
                  {t("approve")}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => act(s.id, "revision")}
                  disabled={busyId === s.id}
                >
                  {t("requestRevision")}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => act(s.id, "reject")}
                  disabled={busyId === s.id}
                >
                  {t("reject")}
                </Button>
                <a
                  href={`https://t.me/${s.telegramUsername}`}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-auto text-xs text-primary hover:underline"
                >
                  {t("viewOnTelegram")} →
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
