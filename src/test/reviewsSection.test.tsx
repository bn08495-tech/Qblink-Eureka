import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { ReviewsSection } from "@/components/qb/ReviewsSection";

describe("ReviewsSection", () => {
  beforeEach(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.clear();
    }
  });

  it("renders verified reviews of Pooja Shah, Payal Gandhi, Sheetal Doshi, and Vaishali Doshi", () => {
    render(<ReviewsSection />);

    expect(screen.getByText("Pooja Shah")).toBeInTheDocument();
    expect(screen.getByText("Payal Gandhi")).toBeInTheDocument();
    expect(screen.getByText("Sheetal Doshi")).toBeInTheDocument();
    expect(screen.getByText("Vaishali Doshi")).toBeInTheDocument();

    expect(screen.getByText(/Apex Multi-Speciality Clinic/i)).toBeInTheDocument();
    expect(screen.getByText(/The Artisan Bistro & Roastery/i)).toBeInTheDocument();
    expect(screen.getByText(/Aura Health & Wellness Studios/i)).toBeInTheDocument();
  });

  it("opens the Add Review modal and allows submitting a new review", async () => {
    render(<ReviewsSection />);

    const addReviewButtons = screen.getAllByRole("button", { name: /add your review|share your experience/i });
    expect(addReviewButtons.length).toBeGreaterThan(0);
    fireEvent.click(addReviewButtons[0]);

    expect(screen.getByText(/Share Your Qblink Experience/i)).toBeInTheDocument();

    const nameInput = screen.getByPlaceholderText(/e\.g\. Pooja Shah/i);
    const feedbackInput = screen.getByPlaceholderText(/Describe how Qblink reduced your waiting room/i);
    const submitBtn = screen.getByRole("button", { name: /post verified review/i });

    fireEvent.change(nameInput, { target: { value: "Rohan Mehta" } });
    fireEvent.change(feedbackInput, { target: { value: "Reduced our peak hour line by 50% on day one!" } });
    fireEvent.click(submitBtn);

    expect(await screen.findByText("Rohan Mehta")).toBeInTheDocument();
    expect(screen.getByText(/Reduced our peak hour line by 50%/i)).toBeInTheDocument();
  });
});
