import { PrismaClient, Role, Sentiment } from "@prisma/client";
import { hash } from "bcryptjs";

const db = new PrismaClient();
const rows = [
  ["Onboarding took forever — I could not figure out how to invite my team.", "Support", "NEGATIVE", "Onboarding"],
  ["The new dashboard is gorgeous and finally fast. Huge improvement.", "App review", "POSITIVE", "Performance"],
  ["It does the job, but the mobile reporting view needs attention.", "NPS survey", "NEUTRAL", "Mobile experience"],
  ["We need SSO before we can sign the contract.", "Sales note", "NEGATIVE", "Authentication"],
  ["The export feature saved me an hour today.", "Community", "POSITIVE", "Reporting"],
  ["Billing times out when I download an invoice.", "Support", "NEGATIVE", "Billing & invoices"],
] as const;

async function main() {
  const workspace = await db.workspace.upsert({ where: { slug: "acme" }, update: {}, create: { name: "Acme workspace", slug: "acme" } });
  const passwordHash = await hash("LoopDemo!2026", 12);
  const members: Array<[string, string, Role]> = [["Aisha Kapoor", "admin@acme.demo", Role.ADMIN], ["Kai Morgan", "analyst@acme.demo", Role.ANALYST], ["Rhea Patel", "viewer@acme.demo", Role.VIEWER]];
  for (const [name, email, role] of members) {
    const user = await db.user.upsert({ where: { email }, update: {}, create: { name, email, passwordHash } });
    await db.membership.upsert({ where: { userId_workspaceId: { userId: user.id, workspaceId: workspace.id } }, update: { role }, create: { userId: user.id, workspaceId: workspace.id, role } });
  }
  for (let i = 0; i < 24; i++) { const [content, channel, sentiment, themeName] = rows[i % rows.length]; const theme = await db.theme.upsert({ where: { workspaceId_name: { workspaceId: workspace.id, name: themeName } }, update: {}, create: { workspaceId: workspace.id, name: themeName } }); const item = await db.feedback.create({ data: { workspaceId: workspace.id, content, channel, sentiment: sentiment as Sentiment, score: sentiment === "POSITIVE" ? 0.8 : sentiment === "NEGATIVE" ? -0.8 : 0, featureArea: themeName, sourceDate: new Date(Date.now() - i * 86_400_000), classifiedAt: new Date() } }); await db.feedbackTheme.create({ data: { feedbackId: item.id, themeId: theme.id } }); }
}
main().finally(() => db.$disconnect());
