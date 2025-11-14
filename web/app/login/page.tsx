'use client';

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useMsal } from "@azure/msal-react";
import { EventType, InteractionStatus, type AuthenticationResult } from "@azure/msal-browser";
import { useRouter, useSearchParams } from "next/navigation";
import { loginRequest } from "@/lib/auth/msal-config";
import { sessionCookieName, sessionMaxAgeSeconds } from "@/lib/auth/constants";

const styles = {
  container: "flex min-h-screen flex-col items-center justify-center bg-neutral-950 px-4 text-white",
  card: "w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900/80 p-8 shadow-lg",
  title: "text-2xl font-semibold text-center",
  description: "mt-2 text-center text-sm text-neutral-300",
  button: "mt-8 w-full rounded-full bg-[#24BBE0] px-4 py-3 text-center text-sm font-semibold uppercase tracking-wide text-neutral-950 transition hover:bg-[#1ba4c5] disabled:cursor-not-allowed disabled:opacity-70",
  footer: "mt-6 text-center text-xs text-neutral-500",
};

const ReCAPTCHA = dynamic(() => import("react-google-recaptcha"), {
  ssr: false,
});

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "";
const RECAPTCHA_ENABLED = Boolean(RECAPTCHA_SITE_KEY);

const buildCookie = (value: string, maxAge: number) => {
  const parts = [
    `${sessionCookieName}=${encodeURIComponent(value)}`,
    `Max-Age=${maxAge}`,
    "Path=/",
    "SameSite=Lax",
  ];

  if (typeof window !== "undefined" && window.location.protocol === "https:") {
    parts.push("Secure");
  }

  return parts.join("; ");
};

const setAuthCookie = (token: string) => {
  document.cookie = buildCookie(token, sessionMaxAgeSeconds);
};

const clearAuthCookie = () => {
  document.cookie = buildCookie("", 0);
};

export default function LoginPage() {
  const { instance, accounts, inProgress } = useMsal();
  const router = useRouter();
  const params = useSearchParams();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [recaptchaError, setRecaptchaError] = useState(false);

  const redirectTo = useMemo(() => params?.get("redirectTo") ?? "/admin", [params]);
  const isAuthenticating = inProgress !== InteractionStatus.None;

  useEffect(() => {
    const callbackId = instance.addEventCallback(event => {
      if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
        const result = event.payload as AuthenticationResult;
        instance.setActiveAccount(result.account);
      }

      if (event.eventType === EventType.LOGIN_FAILURE && event.error) {
        setErrorMessage(event.error.message);
      }
    });

    return () => {
      if (callbackId) {
        instance.removeEventCallback(callbackId);
      }
    };
  }, [instance]);

  const persistSession = useCallback(async () => {
    const activeAccount = instance.getActiveAccount() ?? accounts[0];
    if (!activeAccount) {
      clearAuthCookie();
      return;
    }

    instance.setActiveAccount(activeAccount);

    try {
      const result = await instance.acquireTokenSilent({
        ...loginRequest,
        account: activeAccount,
      });

      setAuthCookie(result.idToken);
      setErrorMessage(null);
      router.replace(redirectTo);
    } catch (error) {
      console.error("Failed to acquire token silently", error);
      clearAuthCookie();
      setErrorMessage("Não foi possível autenticar. Tente novamente.");
    }
  }, [accounts, instance, redirectTo, router]);

  useEffect(() => {
    if (accounts.length > 0 && !isAuthenticating) {
      void persistSession();
    }
  }, [accounts, isAuthenticating, persistSession]);

  useEffect(() => {
    if (accounts.length === 0 && !isAuthenticating) {
      clearAuthCookie();
    }
  }, [accounts, isAuthenticating]);

  const handleLogin = useCallback(async () => {
    setErrorMessage(null);

    if (RECAPTCHA_ENABLED && !recaptchaToken) {
      setRecaptchaError(true);
      return;
    }

    try {
      await instance.loginRedirect(loginRequest);
    } catch (error) {
      console.error("Microsoft login failed", error);
      setErrorMessage("Não foi possível iniciar o login com a Microsoft.");
    }
  }, [instance, recaptchaToken]);

  const handleRecaptchaChange = useCallback((token: string | null) => {
    setRecaptchaToken(token);
    setRecaptchaError(false);
  }, []);

  const handleRecaptchaExpired = useCallback(() => {
    setRecaptchaToken(null);
    setRecaptchaError(true);
  }, []);

  return (
    <main className={styles.container}>
      <section className={styles.card}>
        <h1 className={styles.title}>Área Administrativa</h1>
        <p className={styles.description}>
          Você precisa se autenticar com sua conta corporativa convidada para acessar as ferramentas administrativas.
        </p>

        {errorMessage ? (
          <p className="mt-4 rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-center text-sm text-red-200">
            {errorMessage}
          </p>
        ) : null}

        {RECAPTCHA_ENABLED ? (
          <div className="mt-6 flex flex-col items-center gap-2">
            <ReCAPTCHA
              sitekey={RECAPTCHA_SITE_KEY}
              onChange={handleRecaptchaChange}
              onExpired={handleRecaptchaExpired}
              onErrored={() => setRecaptchaError(true)}
            />
            {recaptchaError ? (
              <p className="text-sm text-red-200">
                Confirme que você não é um robô para continuar.
              </p>
            ) : null}
          </div>
        ) : null}

        <button
          type="button"
          onClick={handleLogin}
          disabled={
            isAuthenticating || (RECAPTCHA_ENABLED && !recaptchaToken)
          }
          className={styles.button}
        >
          {isAuthenticating ? "Redirecionando..." : "Entrar com Microsoft"}
        </button>

        <p className={styles.footer}>
          O acesso é restrito a administradores aprovados. Caso não reconheça esta tela, encerre o navegador.
        </p>
      </section>
    </main>
  );
}
