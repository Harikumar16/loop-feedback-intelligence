import { Role } from "@prisma/client";

export const permissions = {
  manageMembers: [Role.ADMIN],
  writeFeedback: [Role.ADMIN, Role.ANALYST],
  readWorkspace: [Role.ADMIN, Role.ANALYST, Role.VIEWER],
} as const;

export function can(role: Role, action: keyof typeof permissions) {
  return (permissions[action] as readonly Role[]).includes(role);
}
