import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "./testUtils";
import AdminBusinesses from "@/pages/admin/AdminBusinesses";
import AdminCustomers from "@/pages/admin/AdminCustomers";
import AdminQueues from "@/pages/admin/AdminQueues";
import { supabase } from "@/integrations/supabase/client";

describe("Admin Loading & Error States", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("AdminBusinesses", () => {
    it("renders skeleton loading state initially without flashing '0 total'", () => {
      // Mock supabase to return an unresolved promise simulating slow loading
      vi.spyOn(supabase, "from").mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue(new Promise(() => {})),
        }),
      } as any);

      renderWithProviders(<AdminBusinesses />);

      expect(screen.getByTestId("businesses-count-skeleton")).toBeInTheDocument();
      expect(screen.queryByText("0 total")).not.toBeInTheDocument();
      expect(screen.queryByText(/No businesses match/i)).not.toBeInTheDocument();
    });
  });

  describe("AdminCustomers", () => {
    it("renders skeleton loading state initially without flashing '0 total'", () => {
      vi.spyOn(supabase, "from").mockReturnValue({
        select: vi.fn().mockReturnValue(new Promise(() => {})),
      } as any);

      renderWithProviders(<AdminCustomers />);

      expect(screen.getByTestId("customers-count-skeleton")).toBeInTheDocument();
      expect(screen.queryByText("0 total")).not.toBeInTheDocument();
      expect(screen.queryByText(/No customers match/i)).not.toBeInTheDocument();
    });
  });

  describe("AdminQueues", () => {
    it("renders metric cards and live queue table skeletons during loading", () => {
      vi.spyOn(supabase, "from").mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue(new Promise(() => {})),
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue(new Promise(() => {})),
          }),
        }),
      } as any);

      const { container } = renderWithProviders(<AdminQueues />);

      // Metrics should show pulse skeletons, not 0 counts
      const skeletons = container.querySelectorAll('[class*="animate-pulse"]');
      expect(skeletons.length).toBeGreaterThan(0);
      expect(screen.queryByText(/No queues found/i)).not.toBeInTheDocument();
    });
  });
});
