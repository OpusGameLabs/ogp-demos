'use client';

import { OGPClaimProvider } from "@opusgamelabs/claim-react";
import { ThemeProvider as NextThemesProvider } from "next-themes"

function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

export default function Providers({ children }: { children: React.ReactNode }) {

  return (
    <ThemeProvider attribute="class" defaultTheme="system">
      <OGPClaimProvider >
        {children}
      </OGPClaimProvider>
    </ThemeProvider>
  )
}