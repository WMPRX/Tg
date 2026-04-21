"use client";
import * as React from "react";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function RegisterForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [form, setForm] = React.useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [agree, setAgree] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (form.password !== form.confirmPassword) {
      setError(t("passwordMismatch"));
      return;
    }
    if (form.password.length < 8) {
      setError(t("weakPassword"));
      return;
    }
    if (!agree) {
      setError(t("mustAgree"));
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          username: form.username,
          email: form.email,
          password: form.password,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? t("registerFailed"));
        return;
      }
      const signed = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      if (signed?.error) {
        router.push("/login");
      } else {
        router.push("/dashboard");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">{t("name")}</Label>
        <Input id="name" value={form.name} onChange={update("name")} required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="username">{t("username")}</Label>
        <Input
          id="username"
          value={form.username}
          onChange={update("username")}
          pattern="^[a-zA-Z0-9_]{3,32}$"
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">{t("email")}</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={update("email")}
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">{t("password")}</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          value={form.password}
          onChange={update("password")}
          minLength={8}
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          value={form.confirmPassword}
          onChange={update("confirmPassword")}
          minLength={8}
          required
        />
      </div>
      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4"
          checked={agree}
          onChange={(e) => setAgree(e.target.checked)}
          required
        />
        <span>{t("agreeTerms")}</span>
      </label>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button className="w-full" disabled={loading}>
        {loading ? t("registering") : t("registerTitle")}
      </Button>
    </form>
  );
}
