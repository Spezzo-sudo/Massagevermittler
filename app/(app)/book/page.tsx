import { BookingWizard } from '@/components/booking/BookingWizard';
import { SectionHeading } from '@/components/common/SectionHeading';

/** Pizza-style booking flow entry point. */
export default function BookPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-10 px-6 py-12">
      <SectionHeading eyebrow="Booking" title="Massage bestellen wie Pizza" description="Adresse eingeben, Massage wählen, Termin fixieren. Wir matchen automatisch eine verifizierte Therapeutin." />
      <BookingWizard />
    </div>
  );
}
