import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { PublicTherapistProfile } from '@/lib/types/therapist';

async function getTherapist(id: string): Promise<PublicTherapistProfile | null> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  try {
    const res = await fetch(`${baseUrl}/api/therapists/${id}`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      return null;
    }

    return res.json();
  } catch (error) {
    console.error('Error fetching therapist:', error);
    return null;
  }
}

export default async function TherapistDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const therapist = await getTherapist(id);

  if (!therapist) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link
          href="/therapeuten"
          className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 mb-8 font-medium"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Zurück zur Übersicht
        </Link>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header Section */}
          <div className="relative">
            {/* Cover Background */}
            <div className="h-48 bg-gradient-to-r from-brand-500 to-brand-600" />

            {/* Avatar & Basic Info */}
            <div className="px-8 pb-8">
              <div className="relative -mt-20 mb-6">
                <div className="relative h-40 w-40 rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-brand-100 to-brand-50 overflow-hidden">
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
                        className="h-20 w-20 text-brand-300"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              {/* Name & Rating */}
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">
                  {therapist.full_name || 'Therapeut'}
                </h1>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`h-5 w-5 ${
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
                  <span className="text-lg text-slate-600">
                    <span className="font-bold text-slate-900">{therapist.avg_rating.toFixed(1)}</span> / 5.0
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-600">
                    {therapist.total_bookings} Buchungen
                  </span>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-brand-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-brand-600">
                    {therapist.experience_years || 0}
                  </p>
                  <p className="text-sm text-slate-600">Jahre Erfahrung</p>
                </div>
                <div className="bg-brand-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-brand-600">
                    {therapist.services.length}
                  </p>
                  <p className="text-sm text-slate-600">Angebotene Services</p>
                </div>
                <div className="bg-brand-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-brand-600">
                    {therapist.languages?.length || 0}
                  </p>
                  <p className="text-sm text-slate-600">Sprachen</p>
                </div>
              </div>

              {/* Bio Section */}
              {therapist.bio && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-slate-900 mb-3">Über mich</h2>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                    {therapist.bio}
                  </p>
                </div>
              )}

              {/* Languages */}
              {therapist.languages && therapist.languages.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-slate-900 mb-3">Sprachen</h2>
                  <div className="flex flex-wrap gap-3">
                    {therapist.languages.map((lang) => (
                      <span
                        key={lang}
                        className="px-4 py-2 bg-slate-100 text-slate-800 rounded-full font-medium"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Services */}
              {therapist.services.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-slate-900 mb-3">Angebotene Services</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {therapist.services.map((service) => (
                      <div
                        key={service.service_id}
                        className="flex items-center gap-3 p-4 bg-brand-50 rounded-lg border border-brand-100"
                      >
                        <svg
                          className="h-6 w-6 text-brand-600 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className="text-slate-800 font-medium">
                          {service.service_name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Portfolio & Certifications */}
              <div className="flex flex-wrap gap-4 mb-8">
                {therapist.portfolio_url && (
                  <a
                    href={therapist.portfolio_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-medium transition-colors"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Portfolio ansehen
                  </a>
                )}
                {therapist.certifications_url && (
                  <a
                    href={therapist.certifications_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-medium transition-colors"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                    Zertifikate ansehen
                  </a>
                )}
              </div>

              {/* CTA Button */}
              <div className="pt-6 border-t border-slate-200">
                <Link
                  href="/book"
                  className="block w-full sm:w-auto text-center px-8 py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transition-all"
                >
                  Jetzt Termin buchen
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
