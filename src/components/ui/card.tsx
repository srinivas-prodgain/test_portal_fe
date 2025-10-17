"use client";

import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export const Card = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => {
  return <div className={cn("rounded-lg border border-border bg-card shadow-md", className)} {...props} />;
};

export const CardHeader = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => {
  return <div className={cn("border-b border-border px-6 py-4", className)} {...props} />;
};

export const CardTitle = ({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) => {
  return <h2 className={cn("text-lg font-semibold text-card-foreground", className)} {...props} />;
};

export const CardDescription = ({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) => {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />;
};

export const CardContent = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => {
  return <div className={cn("px-6 py-4", className)} {...props} />;
};

export const CardFooter = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => {
  return <div className={cn("flex items-center justify-end gap-3 border-t border-border px-6 py-4", className)} {...props} />;
};
