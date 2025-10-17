"use client";

import { useCallback, useEffect } from "react";

export const useFullscreenGuard = ({
  is_active,
}: {
  is_active: boolean;
}): {
  request_fullscreen: () => Promise<void>;
} => {
  const request_fullscreen = useCallback(async () => {
    if (document.fullscreenElement) {
      return;
    }

    try {
      await document.documentElement.requestFullscreen();
    } catch (error) {
      console.error("Failed to enter fullscreen mode", error);
    }
  }, []);

  useEffect(() => {
    if (!is_active) {
      return;
    }

    const handle_change = () => {
      if (!document.fullscreenElement) {
        // Automatically re-enter fullscreen when user exits
        void request_fullscreen();
      }
    };

    document.addEventListener("fullscreenchange", handle_change);

    return () => {
      document.removeEventListener("fullscreenchange", handle_change);
    };
  }, [is_active, request_fullscreen]);

  return {
    request_fullscreen,
  };
};
