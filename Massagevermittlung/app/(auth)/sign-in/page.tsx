import { AuthCard } from '@/components/forms/AuthCard';

/** Sign-in screen placeholder for Supabase Magic Link flow. */
export default function SignInPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 px-6 py-16">
      <AuthCard mode="sign-in" />
    </div>
  );
}
