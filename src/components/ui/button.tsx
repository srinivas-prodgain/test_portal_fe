"use client";

import type { ButtonHTMLAttributes, DetailedHTMLProps } from "react";

import { cn } from "@/lib/utils";

type TButtonVariant = "default" | "outline";

export type TButtonProps = DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  variant?: TButtonVariant;
};

const button_variants: Record<TButtonVariant, string> = {
  default:
    "bg-primary text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60",
  outline:
    "border border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-60",
};

export const Button = ({ className, type = "button", variant = "default", ...props }: TButtonProps) => {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        button_variants[variant],
        className
      )}
      {...props}
    />
  );
};
