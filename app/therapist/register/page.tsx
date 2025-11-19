import { AuthCard } from '@/components/forms/AuthCard';

export default function TherapistRegisterPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 px-6 py-16">
      <AuthCard mode="sign-up" targetRole="therapist" redirectTo="/therapist" signInLink="/therapist/login" />
    </div>
  );
}
