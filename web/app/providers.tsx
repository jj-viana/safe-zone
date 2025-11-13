'use client';

import { useEffect, useState, type ReactNode } from "react";
import { MsalProvider } from "@azure/msal-react";
import { PublicClientApplication } from "@azure/msal-browser";
import { msalConfig } from "@/lib/auth/msal-config";

type ProvidersProps = {
  children: ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  const [client, setClient] = useState<PublicClientApplication | null>(null);

  useEffect(() => {
    const instance = new PublicClientApplication(msalConfig);
    instance
      .initialize()
      .then(() => setClient(instance))
      .catch((error: unknown) => {
        console.error("Failed to initialize MSAL instance", error);
      });
  }, []);

  if (!client) {
    return null;
  }

  return <MsalProvider instance={client}>{children}</MsalProvider>;
}
