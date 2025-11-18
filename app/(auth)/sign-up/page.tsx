import { AuthCard } from '@/components/forms/AuthCard';

/** Sign-up screen placeholder for Supabase Auth. */
export default function SignUpPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 px-6 py-16">
      <AuthCard mode="sign-up" />
    </div>
  );
}
