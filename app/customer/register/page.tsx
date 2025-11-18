import { AuthCard } from '@/components/forms/AuthCard';

export default function CustomerRegisterPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 px-6 py-16">
      <AuthCard mode="sign-up" targetRole="customer" redirectTo="/customer/dashboard" />
    </div>
  );
}
