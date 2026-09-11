import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "./testUtils";
import SignIn from "@/pages/SignIn";
import CustomerSignUp from "@/pages/CustomerSignUp";
import BusinessSignUp from "@/pages/BusinessSignUp";
import AffiliatePage from "@/pages/AffiliatePage";
import ContactSection from "@/components/ContactSection";

describe("Form Accessibility & Label Associations", () => {
  it("SignIn inputs have associated labels, IDs, and autocomplete attributes", () => {
    renderWithProviders(<SignIn />);

    const phoneInput = screen.getByLabelText(/WhatsApp number/i);
    expect(phoneInput).toHaveAttribute("id", "signin-phone");
    expect(phoneInput).toHaveAttribute("autocomplete", "tel");

    const passwordInput = screen.getByLabelText(/^Password$/i);
    expect(passwordInput).toHaveAttribute("id", "signin-password");
    expect(passwordInput).toHaveAttribute("autocomplete", "current-password");

    const toggleBtn = screen.getByRole("button", { name: /show password|hide password/i });
    expect(toggleBtn).toBeInTheDocument();
  });

  it("CustomerSignUp inputs have associated labels, IDs, and autocomplete attributes", () => {
    renderWithProviders(<CustomerSignUp />);

    const nameInput = screen.getByLabelText(/Full name/i);
    expect(nameInput).toHaveAttribute("id", "customer-name");
    expect(nameInput).toHaveAttribute("autocomplete", "name");

    const phoneInput = screen.getByLabelText(/WhatsApp number/i);
    expect(phoneInput).toHaveAttribute("id", "customer-phone");
    expect(phoneInput).toHaveAttribute("autocomplete", "tel");

    const passwordInput = screen.getByLabelText(/^Password$/i);
    expect(passwordInput).toHaveAttribute("id", "customer-password");
    expect(passwordInput).toHaveAttribute("autocomplete", "new-password");

    const termsLink = screen.getByRole("link", { name: /^terms$/i });
    const privacyLink = screen.getByRole("link", { name: /privacy policy/i });
    expect(termsLink).toHaveAttribute("href", "/terms");
    expect(privacyLink).toHaveAttribute("href", "/privacy");
  });

  it("BusinessSignUp inputs have associated labels, IDs, and step 1 inputs", () => {
    renderWithProviders(<BusinessSignUp />);

    const bizInput = screen.getByLabelText(/Business Name/i);
    expect(bizInput).toHaveAttribute("id", "biz-name");
    expect(bizInput).toHaveAttribute("autocomplete", "organization");
  });

  it("AffiliatePage form inputs have associated labels and autocomplete", () => {
    renderWithProviders(<AffiliatePage />);

    const nameInput = screen.getByLabelText(/Your Name/i);
    expect(nameInput).toHaveAttribute("id", "affiliate-name");
    expect(nameInput).toHaveAttribute("autocomplete", "name");

    const emailInput = screen.getByLabelText(/Email Address/i);
    expect(emailInput).toHaveAttribute("id", "affiliate-email");
    expect(emailInput).toHaveAttribute("autocomplete", "email");

    const phoneInput = screen.getByLabelText(/^Phone/i);
    expect(phoneInput).toHaveAttribute("id", "affiliate-phone");
    expect(phoneInput).toHaveAttribute("autocomplete", "tel");
  });

  it("ContactSection form has accessible labels, IDs, and required attributes", () => {
    renderWithProviders(<ContactSection />);

    const nameInput = screen.getByLabelText(/Your Name/i);
    expect(nameInput).toHaveAttribute("id", "contact-name");
    expect(nameInput).toBeRequired();

    const emailInput = screen.getByLabelText(/Email Address/i);
    expect(emailInput).toHaveAttribute("id", "contact-email");
    expect(emailInput).toBeRequired();

    const phoneInput = screen.getByLabelText(/Phone Number/i);
    expect(phoneInput).toHaveAttribute("id", "contact-phone");
    expect(phoneInput).toBeRequired();
  });
});
