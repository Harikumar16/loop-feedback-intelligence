import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";

export const { handlers, auth } = NextAuth({
  session: { strategy: "jwt" },
  providers: [Credentials({
    credentials: { email: {}, password: {} },
    authorize: async (credentials) => {
      const parsed = z.object({ email: z.string().email(), password: z.string().min(8) }).safeParse(credentials);
      if (!parsed.success) return null;
      const user = await db.user.findUnique({ where: { email: parsed.data.email } });
      if (!user?.passwordHash || !(await compare(parsed.data.password, user.passwordHash))) return null;
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
