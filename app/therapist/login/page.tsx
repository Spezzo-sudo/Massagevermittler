import { AuthCard } from '@/components/forms/AuthCard';

export default function TherapistLoginPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 px-6 py-16">
      <AuthCard mode="sign-in" targetRole="therapist" redirectTo="/therapist" />
    </div>
  );
}
