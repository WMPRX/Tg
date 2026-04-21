import { cn } from "@/lib/utils";

export function ChannelAvatar({
  src,
  name,
  size = 40,
  className,
  showStar = false,
}: {
  src?: string | null;
  name: string;
  size?: number;
  className?: string;
  showStar?: boolean;
}) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
  const bg = hashColor(name);
  return (
    <div
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full text-white",
        className,
      )}
      style={{ width: size, height: size, background: bg }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className="h-full w-full object-cover" loading="lazy" />
      ) : (
        <span style={{ fontSize: size * 0.4 }} className="font-semibold">
          {initials}
        </span>
      )}
      {showStar && (
        <span className="absolute -bottom-0.5 -right-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border-2 border-background bg-amber-400 text-[10px] text-amber-950">
          ★
        </span>
      )}
    </div>
  );
}

function hashColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const h = Math.abs(hash) % 360;
  return `linear-gradient(135deg, hsl(${h},70%,55%), hsl(${(h + 40) % 360},70%,45%))`;
}
