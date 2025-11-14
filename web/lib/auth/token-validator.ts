import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";

const tenantId = process.env.NEXT_PUBLIC_AZURE_TENANT_ID;
const clientId = process.env.NEXT_PUBLIC_AZURE_CLIENT_ID;
const authorityBase = tenantId ? `https://login.microsoftonline.com/${tenantId}` : null;
const issuer = authorityBase ? `${authorityBase}/v2.0` : null;
const jwksUri = authorityBase ? `${authorityBase}/discovery/v2.0/keys` : null;

const jwks = jwksUri ? createRemoteJWKSet(new URL(jwksUri)) : null;

export type TokenValidationResult =
  | { valid: true; payload: JWTPayload }
  | { valid: false; error: Error };

export async function verifyIdToken(token: string): Promise<TokenValidationResult> {
  if (!token || token.trim().length === 0) {
    return { valid: false, error: new Error("Missing token") };
  }

  if (!clientId || !jwks || !issuer) {
    return {
      valid: false,
      error: new Error("Azure AD configuration is missing. Set tenant and client identifiers."),
    };
  }

  try {
    const { payload } = await jwtVerify(token, jwks, {
      issuer,
      audience: clientId,
    });

    return { valid: true, payload };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error : new Error("Token validation failed"),
    };
  }
}
