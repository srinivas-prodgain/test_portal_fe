"use client";

import type { DetailedHTMLProps, TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export type TTextareaProps = DetailedHTMLProps<TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>;

export const Textarea = ({ className, ...props }: TTextareaProps) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      {...props}
    />
  );
};
