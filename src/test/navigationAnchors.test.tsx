import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "./testUtils";
import Index from "@/pages/Index";
import Navbar from "@/components/Navbar";

describe("Landing Navigation & Anchor Targets", () => {
  it("renders all target landing sections with stable IDs matching the navigation menu", () => {
    const { container } = renderWithProviders(<Index />);

    // Verify critical navigation target anchors exist in the DOM
    expect(container.querySelector("#product")).not.toBeNull();
    expect(container.querySelector("#simulation")).not.toBeNull();
    expect(container.querySelector("#industries")).not.toBeNull();
    expect(container.querySelector("#roi")).not.toBeNull();
    expect(container.querySelector("#pricing")).not.toBeNull();
    expect(container.querySelector("#contact")).not.toBeNull();
    expect(container.querySelector("#demo")).not.toBeNull();
    expect(container.querySelector("#faq")).not.toBeNull();
  });

  it("Navbar contains valid links to existing landing anchors and pages", () => {
    renderWithProviders(<Navbar />);

    const productLinks = screen.getAllByRole("link", { name: /^product$/i });
    expect(productLinks[0]).toHaveAttribute("href", "/#product");

    const simulationLinks = screen.getAllByRole("link", { name: /^simulation$/i });
    expect(simulationLinks[0]).toHaveAttribute("href", "/#simulation");

    const contactLinks = screen.getAllByRole("link", { name: /^contact$/i });
    expect(contactLinks[0]).toHaveAttribute("href", "/#contact");
  });

  it("renders ContactSection with accessible form inputs and labels", () => {
    renderWithProviders(<Index />);

    const nameInput = screen.getByLabelText(/Your Name/i);
    const emailInput = screen.getByLabelText(/Email Address/i);
    const businessInput = screen.getByLabelText(/Business Name/i);
    const phoneInput = screen.getByLabelText(/Phone Number/i);
    const messageInput = screen.getByLabelText(/Message \/ Requirements/i);

    expect(nameInput).toHaveAttribute("id", "contact-name");
    expect(emailInput).toHaveAttribute("id", "contact-email");
    expect(businessInput).toHaveAttribute("id", "contact-business");
    expect(phoneInput).toHaveAttribute("id", "contact-phone");
    expect(messageInput).toHaveAttribute("id", "contact-message");
  });
});
