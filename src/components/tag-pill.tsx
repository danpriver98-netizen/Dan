import { tagById } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const COLOR_MAP: Record<string, string> = {
  teal: "bg-teal/15 text-teal",
  violet: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  green: "bg-green-500/15 text-green-600 dark:text-green-400",
  amber: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  blue: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  slate: "bg-slate-500/15 text-slate-600 dark:text-slate-300",
  rose: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
  red: "bg-red-500/15 text-red-600 dark:text-red-400",
  emerald: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  cyan: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400",
  indigo: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400",
  fuchsia: "bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-400",
  orange: "bg-orange-500/15 text-orange-600 dark:text-orange-400",
};

export function TagPill({
  tagId,
  label,
  color,
  onRemove,
  className,
}: {
  tagId?: string;
  label?: string;
  color?: string;
  onRemove?: () => void;
  className?: string;
}) {
  const tag = tagId ? tagById(tagId) : undefined;
  const text = label ?? tag?.label ?? tagId ?? "";
  const c = color ?? tag?.color ?? "slate";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        COLOR_MAP[c] ?? COLOR_MAP.slate,
        className
      )}
    >
      {text}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
          aria-label={`Remove ${text}`}
        >
          ×
        </button>
      )}
    </span>
  );
}
