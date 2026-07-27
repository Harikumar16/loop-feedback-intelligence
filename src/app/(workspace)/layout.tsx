import { AppShell } from "@/components/app-shell";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return <AppShell user={{ name: session.user.name ?? "Your account", email: session.user.email ?? "" }}>{children}</AppShell>;
}
