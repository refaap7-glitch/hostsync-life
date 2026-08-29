import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

const API_URL = process.env.API_URL ?? "http://localhost:4000";
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY ?? "";

interface BackendAuthResponse {
  token: string;
  user: { id: string; name: string; email: string };
}

const providers: NextAuthOptions["providers"] = [
  CredentialsProvider({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) return null;

      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-internal-key": INTERNAL_API_KEY },
        body: JSON.stringify({ email: credentials.email, password: credentials.password }),
      });
      if (!res.ok) return null;

      const data = (await res.json()) as BackendAuthResponse;
      return { id: data.user.id, name: data.user.name, email: data.user.email, accessToken: data.token };
    },
  }),
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  );
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers,
  callbacks: {
    async jwt({ token, user, account }) {
      if (user?.accessToken) {
        token.accessToken = user.accessToken;
        token.userId = user.id;
      }

      if (account?.provider === "google" && token.email && !token.accessToken) {
        const res = await fetch(`${API_URL}/api/auth/oauth-upsert`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-internal-key": INTERNAL_API_KEY },
          body: JSON.stringify({ name: token.name ?? token.email, email: token.email }),
        });
        if (res.ok) {
          const data = (await res.json()) as BackendAuthResponse;
          token.accessToken = data.token;
          token.userId = data.user.id;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.userId as string | undefined;
      }
      (session as { accessToken?: string }).accessToken = token.accessToken as string | undefined;
      return session;
    },
  },
};
