export type BoundingBox = {
  northEast: { lat: number; lng: number };
  southWest: { lat: number; lng: number };
};

/** Bounding box restricting addresses to Ko Phangan. */
export const KO_PHANGAN_BOUNDS: BoundingBox = {
  northEast: { lat: 9.82, lng: 100.06 },
  southWest: { lat: 9.65, lng: 99.93 }
};

/** Roles used throughout Supabase profiles + UI routing. */
export const USER_ROLES = ['customer', 'therapist', 'admin'] as const;
