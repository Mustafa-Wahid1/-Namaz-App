import { cn } from "@/lib/utils";

export default function Skeleton({ className }) {
  return (
    <div className={cn("relative overflow-hidden rounded-xl bg-muted/70", className)} aria-hidden="true">
      <div className="absolute inset-0 shimmer" />
    </div>
  );
}

export function SkeletonCard({ className }) {
  return (
    <div className={cn("card-surface p-5", className)}>
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-4 h-8 w-40" />
      <Skeleton className="mt-3 h-3 w-full" />
      <Skeleton className="mt-2 h-3 w-2/3" />
    </div>
  );
}