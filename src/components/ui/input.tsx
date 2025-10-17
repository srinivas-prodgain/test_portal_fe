"use client";

import type { DetailedHTMLProps, InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export type TInputProps = DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;

export const Input = ({ className, ...props }: TInputProps) => {
  return (
    <input
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      {...props}
    />
  );
};
