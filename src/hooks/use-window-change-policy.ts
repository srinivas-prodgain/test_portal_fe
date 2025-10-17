"use client";

import { useEffect, useRef } from "react";

import type { TViolationType } from "@/types/exam";

export const useWindowChangePolicy = ({
  is_active,
  on_violation,
}: {
  is_active: boolean;
  on_violation?: (type: TViolationType) => void;
}): void => {
  const last_event_timestamp_ref = useRef(0);

  useEffect(() => {
    if (!is_active) {
      return;
    }

    const notify = (type: TViolationType) => {
      if (!on_violation) {
        return;
      }

      const now = Date.now();
      if (now - last_event_timestamp_ref.current < 400) {
        return;
      }

      last_event_timestamp_ref.current = now;
      on_violation(type);
    };

    const handle_visibility_change = () => {
      if (document.visibilityState === "hidden") {
        notify("window-blur");
      }
    };

    const handle_window_blur = () => {
      notify("window-blur");
    };

    const handle_window_focus = () => {
      // Only track focus changes that indicate tab switching
      if (document.visibilityState === "visible") {
        notify("window-focus-change");
      }
    };

    document.addEventListener("visibilitychange", handle_visibility_change);
    window.addEventListener("blur", handle_window_blur);
    window.addEventListener("focus", handle_window_focus);

    return () => {
      document.removeEventListener("visibilitychange", handle_visibility_change);
      window.removeEventListener("blur", handle_window_blur);
      window.removeEventListener("focus", handle_window_focus);
    };
  }, [is_active, on_violation]);
};
