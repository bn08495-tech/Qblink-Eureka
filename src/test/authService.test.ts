import { describe, it, expect, vi, beforeEach } from "vitest";
import { resolveUserDestination, getUserRole } from "../lib/auth/authService";
import { normalizePhone, phoneToEmail, isValidPhone } from "../lib/phoneAuth";
import { supabase } from "../integrations/supabase/client";

describe("Phone Auth Helpers", () => {
  it("normalizes phone numbers properly", () => {
    expect(normalizePhone("+91", "98765 43210")).toBe("919876543210");
    expect(normalizePhone("+1", "(555) 123-4567")).toBe("15551234567");
  });

  it("converts full digits to qblink synthetic email", () => {
    expect(phoneToEmail("919876543210")).toBe("phone_919876543210@qblink.user");
  });

  it("validates phone number length properly", () => {
    expect(isValidPhone("9876543210")).toBe(true);
    expect(isValidPhone("123")).toBe(false);
    expect(isValidPhone("1234567890123456")).toBe(false);
  });
});

describe("resolveUserDestination", () => {
  it("respects safeNext parameter if provided", async () => {
    const dest = await resolveUserDestination("user-123", "/join/demo-queue");
    expect(dest).toBe("/join/demo-queue");
  });

  it("ignores unsafe targetNext links", async () => {
    const dest = await resolveUserDestination("user-123", "https://malicious.site");
    // Will not redirect to external link, will resolve to internal dashboard
    expect(dest.startsWith("/")).toBe(true);
  });

  it("resolves business destination from user metadata instantly", async () => {
    const dest = await resolveUserDestination("biz-user", null, {
      user_metadata: { role: "business" },
    });
    expect(dest).toBe("/dashboard");
  });

  it("resolves customer destination from user metadata instantly", async () => {
    const dest = await resolveUserDestination("cust-user", null, {
      user_metadata: { role: "customer" },
    });
    expect(dest).toBe("/customer-dashboard");
  });

  it("resolves admin destination from admin email instantly", async () => {
    const dest = await resolveUserDestination("admin-user", null, {
      email: "qblinktrial@gmail.com",
    });
    expect(dest).toBe("/admin");
  });
});
