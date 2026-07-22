import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { isDemoMode } from "@/lib/demo-mode";

export const { handlers, auth } = NextAuth({
  session: { strategy: "jwt" },
  providers: [Credentials({
    credentials: { email: {}, password: {} },
    authorize: async (credentials) => {
      const parsed = z.object({ email: z.string().email(), password: z.string().min(8) }).safeParse(credentials);
      if (!parsed.success) return null;
      if (isDemoMode) return { id: "local-demo-user", email: parsed.data.email, name: "Demo user" };
      const user = await db.user.findUnique({ where: { email: parsed.data.email }, include: { memberships: true } });
      if (!user?.passwordHash || !(await compare(parsed.data.password, user.passwordHash))) return null;
      return { id: user.id, email: user.email, name: user.name };
    },
  })],
  pages: { signIn: "/login" },
});

export async function requireWorkspace() {
  const session = await auth();
  if (!session?.user?.email) throw new Error("UNAUTHENTICATED");
  const membership = await db.membership.findFirst({ where: { user: { email: session.user.email } }, include: { workspace: true } });
  if (!membership) throw new Error("NO_WORKSPACE");
  return membership;
}
