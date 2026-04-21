"use client";
import * as React from "react";
import { Search } from "lucide-react";
import { useRouter } from "@/i18n/routing";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function SearchForm({
  initialQuery = "",
  placeholder = "",
}: {
  initialQuery?: string;
  placeholder?: string;
}) {
  const router = useRouter();
  const [q, setQ] = React.useState(initialQuery);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    router.replace(`/search?${params.toString()}`);
  };

  return (
    <form onSubmit={submit} className="flex max-w-xl gap-2">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder} className="h-11 pl-9" />
      </div>
      <Button type="submit" size="lg">
        <Search className="h-4 w-4" />
      </Button>
    </form>
  );
}
