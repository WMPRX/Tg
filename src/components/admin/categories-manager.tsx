"use client";
import * as React from "react";
import { useRouter } from "@/i18n/routing";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

type Item = {
  id: number;
  slug: string;
  name: string;
  rawName: string;
  icon: string;
  order: number;
  isActive: boolean;
  channelCount: number;
};

export function CategoriesManager({ items }: { items: Item[] }) {
  const router = useRouter();
  const [slug, setSlug] = React.useState("");
  const [name, setName] = React.useState("");
  const [icon, setIcon] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          name: { en: name, tr: name },
          icon: icon || null,
        }),
      });
      if (res.ok) {
        setSlug("");
        setName("");
        setIcon("");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  const toggle = async (id: number, isActive: boolean) => {
    await fetch(`/api/admin/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    router.refresh();
  };

  const remove = async (id: number) => {
    if (!confirm("Delete?")) return;
    await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    router.refresh();
  };

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_320px]">
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/30 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3 text-right">Channels</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id} className="border-b last:border-b-0">
                  <td className="px-4 py-3 tabular-nums text-muted-foreground">{c.order}</td>
                  <td className="px-4 py-3 font-mono text-xs">{c.slug}</td>
                  <td className="px-4 py-3 font-medium">
                    {c.icon && <span className="mr-1">{c.icon}</span>}
                    {c.name}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{c.channelCount}</td>
                  <td className="px-4 py-3">
                    <Badge variant={c.isActive ? "default" : "outline"}>
                      {c.isActive ? "Active" : "Hidden"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggle(c.id, c.isActive)}
                    >
                      {c.isActive ? "Hide" : "Show"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="ml-1 text-destructive"
                      onClick={() => remove(c.id)}
                    >
                      ×
                    </Button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    No categories yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h2 className="mb-4 font-semibold">Add category</h2>
          <form onSubmit={create} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="icon">Icon (emoji)</Label>
              <Input id="icon" value={icon} onChange={(e) => setIcon(e.target.value)} />
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
