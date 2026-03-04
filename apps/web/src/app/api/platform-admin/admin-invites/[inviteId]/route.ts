import { AdminInviteStatus, UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { writeAuditLog } from "@/lib/audit-log";
import { prisma } from "@/lib/prisma";
import { requirePlatformAdminSession } from "@/lib/session-guard";

const patchInviteSchema = z
  .object({
    status: z.enum(["PENDING", "REVOKED", "EXPIRED"]).optional(),
    expiresAt: z.string().datetime().optional(),
    note: z.string().trim().max(1000).optional(),
    role: z.enum(["RESEARCH_ADMIN", "PLATFORM_ADMIN"]).optional(),
  })
  .refine(
    (value) =>
      value.status !== undefined ||
      value.expiresAt !== undefined ||
      value.note !== undefined ||
      value.role !== undefined,
    {
      message: "at_least_one_field_required",
    },
  );

function toRole(input: z.infer<typeof patchInviteSchema>["role"]) {
  if (!input) {
    return null;
  }
  return input === "PLATFORM_ADMIN" ? UserRole.PLATFORM_ADMIN : UserRole.RESEARCH_ADMIN;
}

function toStatus(input: z.infer<typeof patchInviteSchema>["status"]) {
  if (!input) {
    return null;
  }
  if (input === "PENDING") return AdminInviteStatus.PENDING;
  if (input === "REVOKED") return AdminInviteStatus.REVOKED;
  return AdminInviteStatus.EXPIRED;
}

type RouteContext = {
  params: Promise<{ inviteId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const session = await requirePlatformAdminSession();
  if (!session) {
    writeAuditLog({
      action: "platform.admin_invite.update",
      result: "FAILURE",
      request,
      targetType: "admin_invite",
      statusCode: 401,
      errorCode: "unauthorized",
    });
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const { inviteId } = await context.params;
  if (!inviteId) {
    writeAuditLog({
      action: "platform.admin_invite.update",
      result: "FAILURE",
      request,
      actorId: session.user.id,
      actorRole: session.user.role,
      targetType: "admin_invite",
      statusCode: 400,
      errorCode: "missing_invite_id",
    });
    return NextResponse.json({ ok: false, error: "missing_invite_id" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const parsed = patchInviteSchema.safeParse(body);
  if (!parsed.success) {
    writeAuditLog({
      action: "platform.admin_invite.update",
      result: "FAILURE",
      request,
      actorId: session.user.id,
      actorRole: session.user.role,
      targetType: "admin_invite",
      targetId: inviteId,
      statusCode: 400,
      errorCode: "invalid_payload",
    });
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }

  const current = await prisma.adminInvite.findUnique({
    where: { id: inviteId },
    select: {
      id: true,
      status: true,
      acceptedAt: true,
      acceptedById: true,
    },
  });
  if (!current) {
    writeAuditLog({
      action: "platform.admin_invite.update",
      result: "FAILURE",
      request,
      actorId: session.user.id,
      actorRole: session.user.role,
      targetType: "admin_invite",
      targetId: inviteId,
      statusCode: 404,
      errorCode: "invite_not_found",
    });
    return NextResponse.json({ ok: false, error: "invite_not_found" }, { status: 404 });
  }

  if (current.status === AdminInviteStatus.ACCEPTED && parsed.data.status === "PENDING") {
    writeAuditLog({
      action: "platform.admin_invite.update",
      result: "FAILURE",
      request,
      actorId: session.user.id,
      actorRole: session.user.role,
      targetType: "admin_invite",
      targetId: inviteId,
      statusCode: 409,
      errorCode: "accepted_invite_cannot_reopen",
    });
    return NextResponse.json({ ok: false, error: "accepted_invite_cannot_reopen" }, { status: 409 });
  }

  const now = new Date();
  const expiresAt = parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null;
  if (expiresAt && Number.isNaN(expiresAt.getTime())) {
    writeAuditLog({
      action: "platform.admin_invite.update",
      result: "FAILURE",
      request,
      actorId: session.user.id,
      actorRole: session.user.role,
      targetType: "admin_invite",
      targetId: inviteId,
      statusCode: 400,
      errorCode: "invalid_expires_at",
    });
    return NextResponse.json({ ok: false, error: "invalid_expires_at" }, { status: 400 });
  }
  if (expiresAt && expiresAt <= now) {
    writeAuditLog({
      action: "platform.admin_invite.update",
      result: "FAILURE",
      request,
      actorId: session.user.id,
      actorRole: session.user.role,
      targetType: "admin_invite",
      targetId: inviteId,
      statusCode: 400,
      errorCode: "expires_at_must_be_future",
    });
    return NextResponse.json({ ok: false, error: "expires_at_must_be_future" }, { status: 400 });
  }

  const status = toStatus(parsed.data.status);
  const role = toRole(parsed.data.role);
  const updated = await prisma.adminInvite.update({
    where: { id: inviteId },
    data: {
      ...(status ? { status } : {}),
      ...(role ? { role } : {}),
      ...(expiresAt ? { expiresAt } : {}),
      ...(parsed.data.note !== undefined
        ? { note: parsed.data.note?.trim() ? parsed.data.note.trim() : null }
        : {}),
      ...(status === AdminInviteStatus.REVOKED ? { revokedAt: now } : {}),
      ...(status === AdminInviteStatus.PENDING ? { revokedAt: null } : {}),
    },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      note: true,
      expiresAt: true,
      acceptedAt: true,
      revokedAt: true,
      createdAt: true,
      updatedAt: true,
      invitedBy: {
        select: {
          id: true,
          role: true,
          email: true,
          displayName: true,
        },
      },
      acceptedBy: {
        select: {
          id: true,
          role: true,
          email: true,
          displayName: true,
        },
      },
    },
  });

  writeAuditLog({
    action: "platform.admin_invite.update",
    result: "SUCCESS",
    request,
    actorId: session.user.id,
    actorRole: session.user.role,
    targetType: "admin_invite",
    targetId: updated.id,
    statusCode: 200,
    detail: {
      status: updated.status,
      role: updated.role,
    },
  });

  return NextResponse.json({
    ok: true,
    invite: {
      ...updated,
      expiresAt: updated.expiresAt.toISOString(),
      acceptedAt: updated.acceptedAt?.toISOString() ?? null,
      revokedAt: updated.revokedAt?.toISOString() ?? null,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    },
  });
}
