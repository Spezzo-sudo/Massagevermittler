/**
 * Supabase Row Level Security (RLS) Policies
 *
 * These policies enforce that users can only access their own data.
 * All tables with user data must have RLS enabled.
 *
 * Enable RLS on tables:
 * ALTER TABLE <table> ENABLE ROW LEVEL SECURITY;
 */

-- ============================================================================
-- PROFILES TABLE - Users can only view/edit their own profile
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- SELECT: Users can view their own profile
CREATE POLICY "Users can view their own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- SELECT: Therapist profiles are publicly viewable (for matching)
CREATE POLICY "Therapist profiles are public"
ON profiles FOR SELECT
USING (role = 'therapist');

-- UPDATE: Users can update their own profile
CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- INSERT: New users can create their profile (via trigger)
CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- ============================================================================
-- THERAPIST_PROFILES TABLE - Therapists manage their own profile
-- ============================================================================

ALTER TABLE therapist_profiles ENABLE ROW LEVEL SECURITY;

-- SELECT: Therapists can view their own profile
CREATE POLICY "Therapists can view their own profile"
ON therapist_profiles FOR SELECT
USING (auth.uid() = therapist_id);

-- SELECT: Approved therapists are publicly searchable (check profile table for approval)
CREATE POLICY "Approved therapists are public"
ON therapist_profiles FOR SELECT
USING (
  is_active = true
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = therapist_profiles.therapist_id
    AND profiles.onboarding_status = 'approved'
  )
);

-- UPDATE: Therapists can only update their own profile
CREATE POLICY "Therapists can update their own profile"
ON therapist_profiles FOR UPDATE
USING (auth.uid() = therapist_id)
WITH CHECK (auth.uid() = therapist_id);

-- INSERT: Therapists can create their own profile
CREATE POLICY "Therapists can insert their own profile"
ON therapist_profiles FOR INSERT
WITH CHECK (auth.uid() = therapist_id);

-- ============================================================================
-- BOOKINGS TABLE - Users can only access their own bookings
-- ============================================================================

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- SELECT: Customers can view their own bookings
CREATE POLICY "Customers can view their own bookings"
ON bookings FOR SELECT
USING (auth.uid() = customer_id);

-- SELECT: Therapists can view their assigned bookings
CREATE POLICY "Therapists can view their bookings"
ON bookings FOR SELECT
USING (auth.uid() = therapist_id);

-- UPDATE: Customers can update their own bookings (cancel, add notes)
CREATE POLICY "Customers can update their own bookings"
ON bookings FOR UPDATE
USING (auth.uid() = customer_id)
WITH CHECK (auth.uid() = customer_id);

-- UPDATE: Therapists can update booking status
CREATE POLICY "Therapists can update booking status"
ON bookings FOR UPDATE
USING (auth.uid() = therapist_id)
WITH CHECK (auth.uid() = therapist_id);

-- INSERT: Only server can insert bookings (no direct client insert)
-- Handled via API endpoint with server-side validation

-- ============================================================================
-- AVAILABILITY_SLOTS TABLE - Therapists manage their own slots
-- ============================================================================

ALTER TABLE availability_slots ENABLE ROW LEVEL SECURITY;

-- SELECT: Therapists can view their own slots
CREATE POLICY "Therapists can view their own availability slots"
ON availability_slots FOR SELECT
USING (auth.uid() = therapist_id);

-- SELECT: Public can view unbooked slots for matching
CREATE POLICY "Public can view available slots"
ON availability_slots FOR SELECT
USING (is_booked = false);

-- INSERT: Therapists can create their own slots
CREATE POLICY "Therapists can create their own slots"
ON availability_slots FOR INSERT
WITH CHECK (auth.uid() = therapist_id);

-- UPDATE: Therapists can update their own slots
CREATE POLICY "Therapists can update their own slots"
ON availability_slots FOR UPDATE
USING (auth.uid() = therapist_id)
WITH CHECK (auth.uid() = therapist_id);

-- DELETE: Therapists can delete their own slots
CREATE POLICY "Therapists can delete their own slots"
ON availability_slots FOR DELETE
USING (auth.uid() = therapist_id);

-- ============================================================================
-- REVIEWS TABLE - Users can view and create reviews
-- ============================================================================

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- SELECT: Everyone can view all reviews (or add is_approved field if needed)
CREATE POLICY "Everyone can view reviews"
ON reviews FOR SELECT
USING (true);

-- INSERT: Customers can create reviews for their bookings
CREATE POLICY "Customers can create reviews for their bookings"
ON reviews FOR INSERT
WITH CHECK (auth.uid() = customer_id);

-- UPDATE: Only review author can edit their own review
CREATE POLICY "Customers can edit their own reviews"
ON reviews FOR UPDATE
USING (auth.uid() = customer_id)
WITH CHECK (auth.uid() = customer_id);

-- ============================================================================
-- ORDERS TABLE - Customers can only view their own orders
-- ============================================================================

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- SELECT: Customers can view their own orders
CREATE POLICY "Customers can view their own orders"
ON orders FOR SELECT
USING (auth.uid() = customer_id);

-- INSERT: Only API can create orders (server-side)
-- (No direct client insert)

-- UPDATE: Customers cannot update orders (only admins via server)

-- ============================================================================
-- PRODUCTS TABLE - Public read-only
-- ============================================================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- SELECT: Everyone can view products
CREATE POLICY "Products are publicly readable"
ON products FOR SELECT
USING (true);

-- All write operations must go through admin API (no RLS policy for INSERT/UPDATE/DELETE)

-- ============================================================================
-- ADDRESSES TABLE - Users can view their own addresses
-- ============================================================================

ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

-- SELECT: Users can view cached Google Places (public cache)
CREATE POLICY "Addresses cache is publicly readable"
ON addresses FOR SELECT
USING (true);

-- INSERT: Server handles Google Places caching

-- ============================================================================
-- SERVICES TABLE - Public read-only
-- ============================================================================

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- SELECT: Everyone can view services
CREATE POLICY "Services are publicly readable"
ON services FOR SELECT
USING (true);

-- ============================================================================
-- THERAPIST_SERVICES TABLE - Public read-only
-- ============================================================================

ALTER TABLE therapist_services ENABLE ROW LEVEL SECURITY;

-- SELECT: Everyone can view therapist services
CREATE POLICY "Therapist services are publicly readable"
ON therapist_services FOR SELECT
USING (true);

-- INSERT/UPDATE: Only therapists can manage their own services
CREATE POLICY "Therapists can manage their own services"
ON therapist_services FOR INSERT
WITH CHECK (auth.uid() = therapist_id);

CREATE POLICY "Therapists can update their own services"
ON therapist_services FOR UPDATE
USING (auth.uid() = therapist_id)
WITH CHECK (auth.uid() = therapist_id);

-- ============================================================================
-- ADMIN OPERATIONS
-- ============================================================================
-- Note: For admin operations (approving therapists, managing products),
-- use authenticated API routes that check for admin role via:
-- SELECT role FROM profiles WHERE id = auth.uid()
-- Do NOT allow direct client access to admin functions.
