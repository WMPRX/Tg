"use client";
import * as React from "react";
import { useRouter } from "@/i18n/routing";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Tag = { id: number; name: string; slug: string; count: number };

export function TagsManager({ items }: { items: Tag[] }) {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug }),
      });
      if (res.ok) {
        setName("");
        setSlug("");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm("Delete?")) return;
    await fetch(`/api/admin/tags/${id}`, { method: "DELETE" });
    router.refresh();
  };

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_320px]">
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/30 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3 text-right">Uses</th>
                <th className="px-4 py-3 text-right" />
              </tr>
            </thead>
            <tbody>
              {items.map((tag) => (
                <tr key={tag.id} className="border-b last:border-b-0">
                  <td className="px-4 py-3 font-medium">{tag.name}</td>
                  <td className="px-4 py-3 font-mono text-xs">{tag.slug}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{tag.count}</td>
                  <td className="px-4 py-3 text-right">
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => remove(tag.id)}>
                      ×
                    </Button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">
                    No tags yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <h2 className="mb-4 font-semibold">Add tag</h2>
          <form onSubmit={create} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="t-name">Name</Label>
              <Input id="t-name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="t-slug">Slug</Label>
              <Input id="t-slug" value={slug} onChange={(e) => setSlug(e.target.value)} required />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              Add
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
