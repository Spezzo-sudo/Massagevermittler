export type BoundingBox = {
  northEast: { lat: number; lng: number };
  southWest: { lat: number; lng: number };
};

/** Bounding box restricting addresses to Ko Phangan. */
export const KO_PHANGAN_BOUNDS: BoundingBox = {
  northEast: { lat: 8.15, lng: 100.45 },
  southWest: { lat: 8.0, lng: 100.35 }
};

/** Roles used throughout Supabase profiles + UI routing. */
export const USER_ROLES = ['customer', 'therapist', 'admin'] as const;
