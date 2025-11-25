import type { Configuration, RedirectRequest } from "@azure/msal-browser";

const tenantId = process.env.NEXT_PUBLIC_AZURE_TENANT_ID;
const clientId = process.env.NEXT_PUBLIC_AZURE_CLIENT_ID;
const redirectUri = process.env.NEXT_PUBLIC_AZURE_REDIRECT_URI ?? "http://localhost:3000/login";

if (!tenantId) {
  console.warn("NEXT_PUBLIC_AZURE_TENANT_ID is not set. Microsoft login will fail until it is configured.");
}

if (!clientId) {
  console.warn("NEXT_PUBLIC_AZURE_CLIENT_ID is not set. Microsoft login will fail until it is configured.");
}

export const msalConfig: Configuration = {
  auth: {
    clientId: clientId ?? "",
    authority: tenantId ? `https://login.microsoftonline.com/${tenantId}` : "https://login.microsoftonline.com/common",
    redirectUri,
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false,
  },
};

const extraScopes = process.env.NEXT_PUBLIC_AZURE_API_SCOPES
  ? process.env.NEXT_PUBLIC_AZURE_API_SCOPES.split(",").map(scope => scope.trim()).filter(Boolean)
  : [];

const baseScopes = ["openid", "profile", "email"] as const;

export const loginRequest: RedirectRequest = {
  scopes: Array.from(new Set([...baseScopes, ...extraScopes])),
};
