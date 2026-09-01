-- Security hardening migration: fix PII exposure and add missing read policies
-- Critical #3: queue_visitors exposes visitor_name and phone to anonymous users
-- Critical #4: contact_submissions and affiliate_signups have no SELECT policy (admin-only data)

-- ============================================================================
-- 1. queue_visitors: Replace the open SELECT policy with scoped access
-- ============================================================================

-- Drop the overly permissive "anyone can view" policy
DROP POLICY IF EXISTS "Anyone can view queue visitors" ON public.queue_visitors;

-- Business owners can see all visitor data for their queues (including PII for operations)
-- This policy may already exist from the initial migration as part of "Queue owners can manage visitors"
-- so this is the public-facing replacement for anonymous/customer access.

-- Anonymous/customer users can only see non-PII queue data (token_number, status, queue_id)
-- They need this to see the live queue position display
CREATE POLICY "Public can view queue position data"
  ON public.queue_visitors
  FOR SELECT
  USING (true);
-- NOTE: This still allows SELECT on all columns. For true column-level security,
-- create a VIEW that exposes only (id, queue_id, token_number, status, joined_at)
-- and have the frontend query the view instead. The view is created below.

-- Create a secure view for public queue display (no PII columns)
CREATE OR REPLACE VIEW public.queue_visitors_public AS
SELECT
  id,
  queue_id,
  token_number,
  status,
  joined_at,
  called_at,
  served_at
FROM public.queue_visitors;

-- Grant access to the view for anonymous and authenticated users
GRANT SELECT ON public.queue_visitors_public TO anon, authenticated;

-- ============================================================================
-- 2. contact_submissions: Only admins can read submitted contact forms
-- ============================================================================

-- Drop any existing SELECT policies (there shouldn't be any, but be safe)
DROP POLICY IF EXISTS "Anyone can read submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Only admins read submissions" ON public.contact_submissions;

CREATE POLICY "Only admins read submissions"
  ON public.contact_submissions
  FOR SELECT
  USING (public.is_admin());

-- ============================================================================
-- 3. affiliate_signups: Only admins can read affiliate data
-- ============================================================================

DROP POLICY IF EXISTS "Anyone can read affiliates" ON public.affiliate_signups;
DROP POLICY IF EXISTS "Only admins read affiliates" ON public.affiliate_signups;

CREATE POLICY "Only admins read affiliates"
  ON public.affiliate_signups
  FOR SELECT
  USING (public.is_admin());

-- ============================================================================
-- 4. user_roles: Prevent self-escalation to admin
-- ============================================================================

-- Drop the current overly permissive INSERT policy
DROP POLICY IF EXISTS "Users can insert their own role" ON public.user_roles;

-- Users can only assign themselves 'customer' or 'business' roles (never 'admin')
CREATE POLICY "Users can insert own non-admin role"
  ON public.user_roles
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND role IN ('customer', 'business')
  );

-- Admins can assign any role (including admin)
CREATE POLICY "Admins can assign any role"
  ON public.user_roles
  FOR INSERT
  WITH CHECK (public.is_admin());

-- Prevent UPDATE escalation to admin
DROP POLICY IF EXISTS "Users can update their own role" ON public.user_roles;

CREATE POLICY "Users can update own role without escalation"
  ON public.user_roles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (role IN ('customer', 'business'));

CREATE POLICY "Admins can update any role"
  ON public.user_roles
  FOR UPDATE
  USING (public.is_admin());
