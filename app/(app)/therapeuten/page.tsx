import Link from 'next/link';
import Image from 'next/image';
import { PublicTherapistProfile } from '@/lib/types/therapist';

export const dynamic = 'force-dynamic';

async function getTherapists(): Promise<PublicTherapistProfile[]> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  try {
    const res = await fetch(`${baseUrl}/api/therapists`, {
      cache: 'no-store', // Always fetch fresh data
    });

    if (!res.ok) {
      console.error('Failed to fetch therapists:', res.status);
      return [];
    }

    return res.json();
  } catch (error) {
    console.error('Error fetching therapists:', error);
    return [];
  }
}

export default async function TherapeutenPage() {
  const therapists = await getTherapists();

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Unsere Therapeuten
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Entdecken Sie unsere professionellen Massage-Therapeuten.
            Alle sind zertifiziert, erfahren und bereit, Ihnen zu helfen.
          </p>
        </div>

        {/* Therapists Grid */}
        {therapists.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600 text-lg">
              Derzeit sind keine Therapeuten verfügbar.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {therapists.map((therapist) => (
              <Link
                key={therapist.id}
                href={`/therapeuten/${therapist.id}`}
                className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-200 hover:border-brand-400"
              >
                {/* Avatar */}
                <div className="relative h-64 bg-gradient-to-br from-brand-100 to-brand-50">
                  {therapist.avatar_url ? (
                    <Image
                      src={therapist.avatar_url}
                      alt={therapist.full_name || 'Therapeut'}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg
                        className="h-24 w-24 text-brand-300"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Name & Rating */}
                  <div className="mb-3">
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                      {therapist.full_name || 'Therapeut'}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.round(therapist.avg_rating)
                                ? 'text-yellow-400'
                                : 'text-slate-300'
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-sm text-slate-600">
                        {therapist.avg_rating.toFixed(1)} ({therapist.total_bookings} Buchungen)
                      </span>
                    </div>
                  </div>

                  {/* Experience */}
                  {therapist.experience_years !== null && (
                    <p className="text-sm text-slate-600 mb-3">
                      <span className="font-semibold">{therapist.experience_years} Jahre</span> Erfahrung
                    </p>
                  )}

                  {/* Bio Preview */}
                  {therapist.bio && (
                    <p className="text-sm text-slate-600 mb-4 line-clamp-3">
                      {therapist.bio}
                    </p>
                  )}

                  {/* Languages */}
                  {therapist.languages && therapist.languages.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {therapist.languages.map((lang) => (
                          <span
                            key={lang}
                            className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-full"
                          >
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Services */}
                  {therapist.services.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-slate-500 mb-2">Angebotene Services:</p>
                      <div className="flex flex-wrap gap-2">
                        {therapist.services.slice(0, 3).map((service) => (
                          <span
                            key={service.service_id}
                            className="px-3 py-1 bg-brand-100 text-brand-700 text-xs font-medium rounded-full"
                          >
                            {service.service_name}
                          </span>
                        ))}
                        {therapist.services.length > 3 && (
                          <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
                            +{therapist.services.length - 3} mehr
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* View Profile Link */}
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <span className="text-brand-600 font-semibold text-sm group-hover:text-brand-700 flex items-center gap-2">
                      Profil ansehen
                      <svg className="h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
