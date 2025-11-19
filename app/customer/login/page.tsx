import { AuthCard } from '@/components/forms/AuthCard';

export default function CustomerLoginPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 px-6 py-16">
      <AuthCard mode="sign-in" targetRole="customer" redirectTo="/(dashboard)/customer" signUpLink="/customer/register" />
    </div>
  );
}
