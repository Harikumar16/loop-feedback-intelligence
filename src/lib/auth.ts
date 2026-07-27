import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";

function authDiagnostic(stage: string, details: Record<string, string | boolean> = {}) {
  if (process.env.AUTH_DEBUG === "true") {
    console.info("[AUTH_DIAGNOSTIC]", stage, details);
  }
}

export const { handlers, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  trustHost: process.env.AUTH_TRUST_HOST === "true",
  session: { strategy: "jwt" },
  providers: [Credentials({
    credentials: { email: {}, password: {} },
    authorize: async (credentials) => {
      const parsed = z.object({ email: z.string().email(), password: z.string().min(8) }).safeParse(credentials);
      if (!parsed.success) {
        authDiagnostic("INVALID_CREDENTIALS_PAYLOAD");
        return null;
      }

      authDiagnostic("AUTHORIZE_STARTED", { databaseConfigured: Boolean(process.env.DATABASE_URL) });
      let user;
      try {
        user = await db.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
      } catch (error) {
        authDiagnostic("DATABASE_LOOKUP_FAILED", { errorType: error instanceof Error ? error.name : "UnknownError" });
        throw error;
      }

      if (!user) {
        authDiagnostic("USER_NOT_FOUND");
        return null;
      }
      if (!user.passwordHash) {
        authDiagnostic("PASSWORD_HASH_MISSING");
        return null;
      }

      const passwordMatches = await compare(parsed.data.password, user.passwordHash);
      if (!passwordMatches) {
        authDiagnostic("PASSWORD_MISMATCH");
        return null;
      }

      authDiagnostic("AUTHORIZE_SUCCEEDED");
      return { id: user.id, email: user.email, name: user.name };
    },
  })],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.sub = user.id;
      return token;
    },
    session({ session, token }) {
      if (session.user && token.sub) session.user.id = token.sub;
      authDiagnostic("SESSION_CREATED", { hasUserId: Boolean(session.user?.id) });
      return session;
    },
  },
  pages: { signIn: "/login" },
});

export async function requireWorkspace() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("UNAUTHENTICATED");
  const membership = await db.membership.findFirst({ where: { userId: session.user.id }, include: { workspace: true }, orderBy: { id: "asc" } });
  if (!membership) throw new Error("NO_WORKSPACE");
  return membership;
}
