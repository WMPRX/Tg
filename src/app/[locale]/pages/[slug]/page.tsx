import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { localize } from "@/lib/utils";

export const revalidate = 600;

export default async function StaticPage({ params }: { params: { locale: string; slug: string } }) {
  const { locale, slug } = params;
  const page = await prisma.page.findUnique({ where: { slug } });
  if (!page || !page.isPublished) notFound();
  const title = localize(page.title, locale);
  const content = localize(page.content, locale);
  return (
    <article className="container max-w-3xl py-10">
      <h1 className="mb-6 text-3xl font-bold">{title}</h1>
      <div className="prose prose-sm max-w-none whitespace-pre-wrap dark:prose-invert">{content}</div>
    </article>
  );
}
