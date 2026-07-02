import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "card" | "avatar" | "image" | "circle";
}

function Skeleton({ className, variant = "text" }: SkeletonProps) {
  const variants = {
    text: "h-4 w-full rounded",
    card: "h-48 w-full rounded-premium",
    avatar: "h-10 w-10 rounded-full",
    image: "h-64 w-full rounded-premium",
    circle: "h-12 w-12 rounded-full",
  };

  return (
    <div
      className={cn(
        "bg-charcoal/5 dark:bg-white/5 skeleton-shimmer relative overflow-hidden",
        variants[variant],
        className
      )}
    />
  );
}

function SkeletonCard() {
  return (
    <div className="glass rounded-premium p-4 space-y-3">
      <Skeleton variant="image" />
      <Skeleton variant="text" className="w-3/4" />
      <Skeleton variant="text" className="w-1/2" />
      <div className="flex gap-2 pt-2">
        <Skeleton variant="circle" className="h-8 w-8" />
        <div className="flex-1 space-y-1.5">
          <Skeleton variant="text" className="w-1/3" />
          <Skeleton variant="text" className="w-1/4" />
        </div>
      </div>
    </div>
  );
}

function SkeletonScreen({ type = "search" }: { type?: "search" | "detail" | "dashboard" | "chat" }) {
  if (type === "detail") {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <Skeleton variant="image" className="h-[400px]" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <Skeleton variant="text" className="w-1/2 h-8" />
            <Skeleton variant="text" className="w-3/4" />
            <Skeleton variant="text" className="w-full" />
            <Skeleton variant="text" className="w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton variant="card" className="h-48" />
            <Skeleton variant="text" className="w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (type === "dashboard") {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="flex gap-4">
          <Skeleton variant="card" className="h-32 flex-1" />
          <Skeleton variant="card" className="h-32 flex-1" />
          <Skeleton variant="card" className="h-32 flex-1" />
        </div>
        <Skeleton variant="card" className="h-64" />
      </div>
    );
  }

  if (type === "chat") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={`flex gap-3 ${i % 2 === 0 ? "" : "flex-row-reverse"}`}>
            <Skeleton variant="circle" className="h-8 w-8 shrink-0" />
            <Skeleton variant="text" className={`h-12 ${i % 2 === 0 ? "w-2/3" : "w-1/2"}`} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex gap-4">
        <Skeleton variant="text" className="w-1/4 h-10" />
        <Skeleton variant="text" className="w-1/4 h-10" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}

export { Skeleton, SkeletonCard, SkeletonScreen };
