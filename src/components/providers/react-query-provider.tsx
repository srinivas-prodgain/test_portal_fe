"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useState } from "react";

export const ReactQueryProvider = ({ children }: { children: ReactNode }) => {
  const [query_client] = useState(() => new QueryClient());

  return <QueryClientProvider client={query_client}>{children}</QueryClientProvider>;
};
