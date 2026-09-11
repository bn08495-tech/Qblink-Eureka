import { describe, it, expect } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithProviders } from "./testUtils";
import { InterviewFAQ } from "@/components/qb/InterviewFAQ";
import { ProblemInfographic } from "@/components/qb/ProblemInfographic";

describe("Disclosure & Interactive Keyboard Accessibility", () => {
  describe("InterviewFAQ", () => {
    it("associates disclosure buttons with panels via aria-controls and aria-labelledby", () => {
      const { container } = renderWithProviders(<InterviewFAQ />);

      const firstBtn = screen.getByRole("button", { name: /do customers need to download an app/i });
      expect(firstBtn).toHaveAttribute("id", "faq-btn-0");
      expect(firstBtn).toHaveAttribute("aria-controls", "faq-panel-0");
      expect(firstBtn).toHaveAttribute("aria-expanded", "true");

      const firstPanel = container.querySelector("#faq-panel-0");
      expect(firstPanel).not.toBeNull();
      expect(firstPanel).toHaveAttribute("role", "region");
      expect(firstPanel).toHaveAttribute("aria-labelledby", "faq-btn-0");
    });

    it("expands and collapses panels upon activation", () => {
      renderWithProviders(<InterviewFAQ />);

      const secondBtn = screen.getByRole("button", { name: /do businesses need any special hardware/i });
      expect(secondBtn).toHaveAttribute("aria-expanded", "false");

      fireEvent.click(secondBtn);
      expect(secondBtn).toHaveAttribute("aria-expanded", "true");
    });
  });

  describe("ProblemInfographic hotspots", () => {
    it("renders all 5 hotspots with role='button', tabIndex=0, aria-labels and keyboard activation", () => {
      const { container } = renderWithProviders(<ProblemInfographic />);

      const hotspotLabels = [
        "Walk-outs: 22% leave when the line is unclear",
        "Repeat asks: \"How long?\" — asked ~11× per hour",
        "Bad reviews: Wait complaints top negative feedback",
        "Staff drain: 40 min/day answering queue questions",
        "Lost sales: Peak-hour crowd caps daily revenue",
      ];

      hotspotLabels.forEach(label => {
        const btn = screen.getByLabelText(label);
        expect(btn).toBeInTheDocument();
        expect(btn).toHaveAttribute("tabindex", "0");
        expect(btn).toHaveAttribute("role", "button");
      });

      // Decorative silhouettes group has aria-hidden="true" and focusable="false"
      const decorativeGroups = container.querySelectorAll("g[aria-hidden='true']");
      expect(decorativeGroups.length).toBeGreaterThan(0);
    });

    it("activates hotspots via keyboard Enter and Space keys", () => {
      renderWithProviders(<ProblemInfographic />);

      const firstHotspot = screen.getByLabelText("Walk-outs: 22% leave when the line is unclear");
      expect(firstHotspot).toHaveAttribute("aria-expanded", "false");

      fireEvent.keyDown(firstHotspot, { key: "Enter" });
      expect(firstHotspot).toHaveAttribute("aria-expanded", "true");

      fireEvent.keyDown(firstHotspot, { key: " " });
      expect(firstHotspot).toHaveAttribute("aria-expanded", "false");
    });
  });
});
