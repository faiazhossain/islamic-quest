import { createHmac } from "node:crypto";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import type { Provider } from "next-auth/providers";

/**
 * Sync rows are keyed by a pseudonymous id, never the raw email, so a
 * database leak can never pair an identity with a worship history.
 * Deriving from AUTH_SECRET keeps the id stable across sign-ins; rotating
 * that secret intentionally detaches existing server copies from their
 * owners (local data is unaffected).
 */
function hashUserKey(value: string): string {
  return createHmac("sha256", process.env.AUTH_SECRET ?? "")
    .update(value)
    .digest("hex");
}

function buildProviders(): Provider[] {
  const providers: Provider[] = [];
  if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
    providers.push(Google);
  }
  if (process.env.AUTH_RESEND_KEY && process.env.EMAIL_FROM) {
    providers.push(
      Resend({
        apiKey: process.env.AUTH_RESEND_KEY,
        from: process.env.EMAIL_FROM,
      }),
    );
  }
  return providers;
}

const providers = buildProviders();

/**
 * Sync is optional by product contract: true only when the whole stack
 * (a provider, a secret, and a database) is configured. Every route and
 * UI surface checks this and degrades to local-only mode.
 */
export const authEnabled =
  providers.length > 0 &&
  Boolean(process.env.AUTH_SECRET) &&
  Boolean(process.env.DATABASE_URL);

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        // Email is stable across sign-ins; fall back to the provider subject.
        const identity = user.email ?? token.sub;
        if (typeof identity === "string") {
          (token as { userKey?: string }).userKey = hashUserKey(identity);
        }
      }
      return token;
    },
    session({ session, token }) {
      const userKey = (token as { userKey?: unknown }).userKey;
      if (typeof userKey === "string") {
        (session.user as { userKey?: string }).userKey = userKey;
      }
      return session;
    },
  },
});
