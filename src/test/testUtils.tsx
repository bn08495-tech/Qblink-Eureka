import React from "react";
import { render as rtlRender, RenderOptions } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "@/hooks/useTheme";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

interface CustomWrapperProps {
  children: React.ReactNode;
  initialEntries?: string[];
}

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
}

export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, "wrapper"> & { initialEntries?: string[] }
) {
  const queryClient = createTestQueryClient();
  const helmetContext = {};

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <HelmetProvider context={helmetContext}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <TooltipProvider>
            <MemoryRouter initialEntries={options?.initialEntries || ["/"]}>
              {children}
            </MemoryRouter>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );

  return rtlRender(ui, { wrapper: Wrapper, ...options });
}
