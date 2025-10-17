"use client";

import type { DetailedHTMLProps, LabelHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export type TLabelProps = DetailedHTMLProps<LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement>;

export const Label = ({ className, ...props }: TLabelProps) => {
  return <label className={cn("text-sm font-medium text-foreground", className)} {...props} />;
};
