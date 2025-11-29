'use client';

import dynamic from "next/dynamic";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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

type ClientPrincipal = {
  userRoles: string[];
  userDetails?: string | null;
};

type AuthResponse = {
  clientPrincipal?: ClientPrincipal | null;
};

const ADMIN_ROLE = "admin";

async function fetchClientPrincipal(): Promise<ClientPrincipal | null> {
  try {
    const response = await fetch("/.auth/me", { cache: "no-store" });
    if (!response.ok) {
      return null;
    }

    const payload: AuthResponse = await response.json();
    return payload?.clientPrincipal ?? null;
  } catch (error) {
    console.warn("Não foi possível verificar a sessão atual", error);
    return null;
  }
}

function LoginPageContent() {
  const router = useRouter();
  const params = useSearchParams();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [recaptchaError, setRecaptchaError] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const redirectParam = params?.get("redirectTo") ?? "/admin";
  const redirectTo = useMemo(() => {
    if (!redirectParam || !redirectParam.startsWith("/")) {
      return "/admin";
    }

    return redirectParam;
  }, [redirectParam]);

  useEffect(() => {
    let active = true;

    const checkExistingSession = async () => {
      const principal = await fetchClientPrincipal();

      if (!active) {
        return;
      }

      if (principal?.userRoles?.includes(ADMIN_ROLE)) {
        router.replace(redirectTo);
        return;
      }

      setCheckingSession(false);
    };

    void checkExistingSession();

    return () => {
      active = false;
    };
  }, [redirectTo, router]);

  const handleLogin = useCallback(async () => {
    setErrorMessage(null);

    if (RECAPTCHA_ENABLED && !recaptchaToken) {
      setRecaptchaError(true);
      return;
    }

    if (typeof window === "undefined") {
      setErrorMessage("Ação de login indisponível neste ambiente.");
      return;
    }

    setRedirecting(true);
    const loginUrl = `/.auth/login/aad?post_login_redirect_uri=${encodeURIComponent(redirectTo)}`;
    window.location.href = loginUrl;
  }, [recaptchaToken, redirectTo]);

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
            checkingSession ||
            redirecting ||
            (RECAPTCHA_ENABLED && !recaptchaToken)
          }
          className={styles.button}
        >
          {redirecting ? "Redirecionando..." : "Entrar com Microsoft"}
        </button>

        {checkingSession ? (
          <p className="mt-3 text-center text-xs text-neutral-400">
            Verificando sessão existente...
          </p>
        ) : null}

        <p className={styles.footer}>
          O acesso é restrito a administradores aprovados. Caso não reconheça esta tela, encerre o navegador.
        </p>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}
