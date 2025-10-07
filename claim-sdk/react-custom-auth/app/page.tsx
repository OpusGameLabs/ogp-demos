'use client';

import { useAuth } from '@/contexts/auth';
import LoginForm from '@/components/login-form';
import { OGPClaimButton, useOGPClaim } from '@opusgamelabs/claim-react';

export default function Home() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { startClaim } = useOGPClaim();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        {isAuthenticated ? (
          <div className="p-4 text-center flex flex-col items-center justify-center text-black bg-gray-200 rounded-lg shadow-md">
            <h1 className="text-lg font-bold">
              User Id: {user?.uid}
            </h1>
            <OGPClaimButton>
              Claim Your Rewards
            </OGPClaimButton>
          </div>
        ) : (
          <LoginForm />
        )}
      </div>
    </main>
  );
}