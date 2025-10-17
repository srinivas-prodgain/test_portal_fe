"use client";

import { createContext, useContext, type HTMLAttributes, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";
import { Button } from "./button";

type TDialogContext = {
  open: boolean;
  on_open_change: (open: boolean) => void;
};

const DialogContext = createContext<TDialogContext | null>(null);

const useDialogContext = (): TDialogContext => {
  const context = useContext(DialogContext);

  if (!context) {
    throw new Error("Dialog components must be used within Dialog.");
  }

  return context;
};

export const Dialog = ({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}) => {
  return <DialogContext.Provider value={{ open, on_open_change: onOpenChange }}>{children}</DialogContext.Provider>;
};

export const DialogContent = ({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) => {
  const { open, on_open_change } = useDialogContext();

  if (!open) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6 relative">
      <button
        type="button"
        aria-label="Close dialog overlay"
        className="absolute inset-0 h-full w-full cursor-default bg-transparent"
        onClick={() => on_open_change(false)}
      />
      <div
        className={cn(
          "relative z-10 w-full max-w-lg rounded-lg border border-border bg-card p-6 shadow-xl focus:outline-none",
          className
        )}
        role="dialog"
        aria-modal="true"
        {...props}
      >
        {children}
      </div>
    </div>,
    document.body
  );
};

export const DialogHeader = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => {
  return <div className={cn("mb-4 space-y-1 text-left", className)} {...props} />;
};

export const DialogTitle = ({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) => {
  return <h3 className={cn("text-lg font-semibold text-card-foreground", className)} {...props} />;
};

export const DialogDescription = ({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) => {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />;
};

export const DialogFooter = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => {
  return <div className={cn("mt-6 flex flex-wrap justify-end gap-3", className)} {...props} />;
};

export const DialogClose = ({
  children,
  className,
  onClick,
  ...props
}: HTMLAttributes<HTMLButtonElement> & { children: ReactNode }) => {
  const { on_open_change } = useDialogContext();

  return (
    <Button
      className={cn("bg-secondary text-secondary-foreground hover:bg-secondary/80", className)}
      onClick={(event) => {
        onClick?.(event);
        on_open_change(false);
      }}
      {...props}
    >
      {children}
    </Button>
  );
};
