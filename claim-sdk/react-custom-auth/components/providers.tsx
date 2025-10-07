'use client';

import { useAuth } from "@/contexts/auth";
import { OGPClaimProvider } from "@opusgamelabs/claim-react";

export default function Providers({ children }: { children: React.ReactNode }) {

  return (
    <OGPClaimProvider config={{
      useCustomAuth: true,
      customAuthConfig: {
        useAuthHook: useAuth,
      }
    }}>
      {children}
    </OGPClaimProvider>
  )
}