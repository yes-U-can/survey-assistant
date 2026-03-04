import { Prisma, UserRole } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export function buildParticipantScope(
  adminId: string,
  adminRole: UserRole,
): Prisma.UserWhereInput {
  if (adminRole === UserRole.PLATFORM_ADMIN) {
    return { role: UserRole.PARTICIPANT };
  }

  return {
    role: UserRole.PARTICIPANT,
    OR: [
      {
        enrollments: {
          some: {
            surveyPackage: {
              ownerId: adminId,
            },
          },
        },
      },
      {
        responses: {
          some: {
            surveyPackage: {
              ownerId: adminId,
            },
          },
        },
      },
    ],
  };
}

export async function canAdminManageParticipant(
  adminId: string,
  adminRole: UserRole,
  participantId: string,
) {
  const count = await prisma.user.count({
    where: {
      ...buildParticipantScope(adminId, adminRole),
      id: participantId,
    },
  });
  return count > 0;
}
