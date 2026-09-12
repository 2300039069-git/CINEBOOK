import React from 'react';

export const Skeleton = ({ className = '', ...props }) => {
  return (
    <div
      className={`animate-pulse rounded-lg bg-surface-elevated/70 border border-border/40 ${className}`}
      {...props}
    />
  );
};

export const MovieCardSkeleton = () => {
  return (
    <div className="rounded-2xl bg-surface-card border border-border/60 overflow-hidden flex flex-col p-3 space-y-3">
      <Skeleton className="w-full aspect-[2/3] rounded-xl" />
      <Skeleton className="h-4 w-3/4 rounded" />
      <div className="flex items-center justify-between pt-1">
        <Skeleton className="h-3 w-1/3 rounded" />
        <Skeleton className="h-3 w-1/4 rounded" />
      </div>
      <Skeleton className="h-9 w-full rounded-xl mt-2" />
    </div>
  );
};

export const ShowtimeSkeleton = () => {
  return (
    <div className="rounded-xl bg-surface-card border border-border/60 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-48 rounded" />
        <Skeleton className="h-4 w-20 rounded" />
      </div>
      <div className="flex flex-wrap gap-2 pt-2">
        <Skeleton className="h-10 w-24 rounded-lg" />
        <Skeleton className="h-10 w-24 rounded-lg" />
        <Skeleton className="h-10 w-24 rounded-lg" />
        <Skeleton className="h-10 w-24 rounded-lg" />
      </div>
    </div>
  );
};
