import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "./testUtils";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";
import RoleSelection from "@/pages/RoleSelection";
import Footer from "@/components/Footer";

describe("Legal Routes & Disclosures", () => {
  it("renders Privacy Policy with prominent draft review banner and contact point", () => {
    renderWithProviders(<PrivacyPolicy />);

    expect(screen.getByText(/DRAFT FOR FOUNDER & LEGAL COUNSEL REVIEW/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Privacy Policy/i, level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/teamqblink@gmail.com/i)).toBeInTheDocument();
    expect(screen.getByText(/Third-Party Subprocessors/i)).toBeInTheDocument();
  });

  it("renders Terms of Service with draft banner and fair use terms", () => {
    renderWithProviders(<TermsOfService />);

    expect(screen.getByText(/DRAFT FOR FOUNDER & LEGAL COUNSEL REVIEW/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Terms of Service/i, level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/teamqblink@gmail.com/i)).toBeInTheDocument();
    expect(screen.getByText(/Governing Law & Enterprise Contracting/i)).toBeInTheDocument();
  });

  it("Footer links resolve to /privacy and /terms instead of dead anchors", () => {
    renderWithProviders(<Footer />);

    const privacyLink = screen.getByRole("link", { name: /privacy policy/i });
    const termsLink = screen.getByRole("link", { name: /terms of service/i });

    expect(privacyLink).toHaveAttribute("href", "/privacy");
    expect(termsLink).toHaveAttribute("href", "/terms");
  });

  it("RoleSelection contains accessible links to /terms and /privacy", () => {
    renderWithProviders(<RoleSelection />);

    const termsLink = screen.getByRole("link", { name: /^terms$/i });
    const privacyLink = screen.getByRole("link", { name: /privacy policy/i });

    expect(termsLink).toHaveAttribute("href", "/terms");
    expect(privacyLink).toHaveAttribute("href", "/privacy");
  });
});
