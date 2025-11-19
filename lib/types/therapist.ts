export type TherapistProfile = {
  therapist_id: string;
  bio: string | null;
  experience_years: number | null;
  languages: string[] | null;
  travel_radius_km: number | null;
  latitude: number | null;
  longitude: number | null;
  avg_rating: number;
  total_bookings: number;
  is_active: boolean;
  payout_method: string | null;
  payout_details: string | null;
  portfolio_url: string | null;
  certifications_url: string | null;
  calendar_note: string | null;
  profile_completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type TherapistWithProfile = {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  phone_number: string | null;
  avatar_url: string | null;
  onboarding_status: string;
  therapist_profile: TherapistProfile;
  services: {
    service_id: number;
    service_name: string;
    active: boolean;
  }[];
};

export type PublicTherapistProfile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  experience_years: number | null;
  languages: string[] | null;
  avg_rating: number;
  total_bookings: number;
  portfolio_url: string | null;
  certifications_url: string | null;
  services: {
    service_id: number;
    service_name: string;
  }[];
};
