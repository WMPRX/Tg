"use client";
import * as React from "react";
import { useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Page = { id: number; slug: string; title: string; isPublished: boolean };

export function PagesManager({ items }: { items: Page[] }) {
  const router = useRouter();
  const [slug, setSlug] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          title: { en: title, tr: title },
          content: { en: content, tr: content },
        }),
      });
      if (res.ok) {
        setSlug("");
        setTitle("");
        setContent("");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  const togglePublish = async (id: number, published: boolean) => {
    await fetch(`/api/admin/pages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !published }),
    });
    router.refresh();
  };

  const remove = async (id: number) => {
    if (!confirm("Delete?")) return;
    await fetch(`/api/admin/pages/${id}`, { method: "DELETE" });
    router.refresh();
  };

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_360px]">
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/30 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right" />
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id} className="border-b last:border-b-0">
                  <td className="px-4 py-3 font-mono text-xs">{p.slug}</td>
                  <td className="px-4 py-3 font-medium">{p.title}</td>
                  <td className="px-4 py-3">
                    <Badge variant={p.isPublished ? "default" : "outline"}>
                      {p.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button size="sm" variant="outline" onClick={() => togglePublish(p.id, p.isPublished)}>
                      {p.isPublished ? "Unpublish" : "Publish"}
                    </Button>
                    <Button size="sm" variant="ghost" className="ml-1 text-destructive" onClick={() => remove(p.id)}>
                      ×
                    </Button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">
                    No pages yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
      <form onSubmit={create} className="space-y-3 rounded-lg border bg-muted/20 p-4">
        <h3 className="font-semibold">New page</h3>
        <div className="space-y-1.5">
          <Label htmlFor="p-slug">Slug</Label>
          <Input id="p-slug" value={slug} onChange={(e) => setSlug(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="p-title">Title</Label>
          <Input id="p-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="p-content">Content (markdown)</Label>
          <textarea
            id="p-content"
            rows={6}
            className="w-full rounded-md border border-input bg-background p-3 text-sm"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>
        <Button type="submit" disabled={loading} className="w-full">
          Create
        </Button>
      </form>
    </div>
  );
}
