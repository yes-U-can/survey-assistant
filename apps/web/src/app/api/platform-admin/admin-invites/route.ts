import { AdminInviteStatus, UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { writeAuditLog } from "@/lib/audit-log";
import { prisma } from "@/lib/prisma";
import { requirePlatformAdminSession } from "@/lib/session-guard";

const createInviteSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(320),
  role: z.enum(["RESEARCH_ADMIN", "PLATFORM_ADMIN"]).default("RESEARCH_ADMIN"),
  expiresAt: z.string().datetime().optional(),
  note: z.string().trim().max(1000).optional(),
});

function parseLimit(raw: string | null) {
  const fallback = 50;
  if (!raw) {
    return fallback;
  }
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.max(1, Math.min(Math.trunc(parsed), 200));
}

function toRole(input: z.infer<typeof createInviteSchema>["role"]) {
  return input === "PLATFORM_ADMIN" ? UserRole.PLATFORM_ADMIN : UserRole.RESEARCH_ADMIN;
}

function toStatus(input: string | null) {
  if (input === "PENDING") return AdminInviteStatus.PENDING;
  if (input === "ACCEPTED") return AdminInviteStatus.ACCEPTED;
  if (input === "REVOKED") return AdminInviteStatus.REVOKED;
  if (input === "EXPIRED") return AdminInviteStatus.EXPIRED;
  return null;
}

export async function GET(request: Request) {
  const session = await requirePlatformAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = parseLimit(searchParams.get("limit"));
  const status = toStatus(searchParams.get("status"));

  const invites = await prisma.adminInvite.findMany({
    where: status ? { status } : undefined,
    take: limit,
    orderBy: [{ createdAt: "desc" }],
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

  return NextResponse.json({
    ok: true,
    invites: invites.map((invite) => ({
      ...invite,
      expiresAt: invite.expiresAt.toISOString(),
      acceptedAt: invite.acceptedAt?.toISOString() ?? null,
      revokedAt: invite.revokedAt?.toISOString() ?? null,
      createdAt: invite.createdAt.toISOString(),
      updatedAt: invite.updatedAt.toISOString(),
    })),
  });
}

export async function POST(request: Request) {
  const session = await requirePlatformAdminSession();
  if (!session) {
    writeAuditLog({
      action: "platform.admin_invite.create",
      result: "FAILURE",
      request,
      targetType: "admin_invite",
      statusCode: 401,
      errorCode: "unauthorized",
    });
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createInviteSchema.safeParse(body);
  if (!parsed.success) {
    writeAuditLog({
      action: "platform.admin_invite.create",
      result: "FAILURE",
      request,
      actorId: session.user.id,
      actorRole: session.user.role,
      targetType: "admin_invite",
      statusCode: 400,
      errorCode: "invalid_payload",
    });
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }

  const now = new Date();
  const expiresAt = parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null;
  if (expiresAt && Number.isNaN(expiresAt.getTime())) {
    writeAuditLog({
      action: "platform.admin_invite.create",
      result: "FAILURE",
      request,
      actorId: session.user.id,
      actorRole: session.user.role,
      targetType: "admin_invite",
      statusCode: 400,
      errorCode: "invalid_expires_at",
    });
    return NextResponse.json({ ok: false, error: "invalid_expires_at" }, { status: 400 });
  }
  if (expiresAt && expiresAt <= now) {
    writeAuditLog({
      action: "platform.admin_invite.create",
      result: "FAILURE",
      request,
      actorId: session.user.id,
      actorRole: session.user.role,
      targetType: "admin_invite",
      statusCode: 400,
      errorCode: "expires_at_must_be_future",
    });
    return NextResponse.json({ ok: false, error: "expires_at_must_be_future" }, { status: 400 });
  }

  const created = await prisma.adminInvite.create({
    data: {
      email: parsed.data.email,
      role: toRole(parsed.data.role),
      status: AdminInviteStatus.PENDING,
      note: parsed.data.note?.trim() ? parsed.data.note.trim() : null,
      invitedById: session.user.id,
      expiresAt: expiresAt ?? new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
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
    action: "platform.admin_invite.create",
    result: "SUCCESS",
    request,
    actorId: session.user.id,
    actorRole: session.user.role,
    targetType: "admin_invite",
    targetId: created.id,
    statusCode: 201,
    detail: {
      role: created.role,
      status: created.status,
    },
  });

  return NextResponse.json(
    {
      ok: true,
      invite: {
        ...created,
        expiresAt: created.expiresAt.toISOString(),
        acceptedAt: created.acceptedAt?.toISOString() ?? null,
        revokedAt: created.revokedAt?.toISOString() ?? null,
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt.toISOString(),
      },
    },
    { status: 201 },
  );
}
