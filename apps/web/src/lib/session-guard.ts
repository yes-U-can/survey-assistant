import { UserRole } from "@prisma/client";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";

export async function requireParticipantSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return null;
  }
  if (session.user.role !== UserRole.PARTICIPANT) {
    return null;
  }
  return session;
}

export async function requireAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return null;
  }

  if (
    session.user.role !== UserRole.RESEARCH_ADMIN &&
    session.user.role !== UserRole.PLATFORM_ADMIN
  ) {
    return null;
  }

  return session;
}

export async function requirePlatformAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return null;
  }
  if (session.user.role !== UserRole.PLATFORM_ADMIN) {
    return null;
  }
  return session;
}
