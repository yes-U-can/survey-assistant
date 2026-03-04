import { AdminInviteStatus, Locale, UserRole } from "@prisma/client";
import { compare } from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

import { prisma } from "@/lib/prisma";
import { consumeRateLimit } from "@/lib/rate-limit";

type AuthUser = {
  id: string;
  role: UserRole;
  locale: Locale;
  name?: string | null;
};

const bootstrapPlatformAdminEmails = new Set(
  (process.env.PLATFORM_ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => normalizeEmail(email))
    .filter((email): email is string => Boolean(email)),
);

const participantLoginRateLimit = {
  limit: parseIntEnv("AUTH_PARTICIPANT_LOGIN_RATE_LIMIT", 10, 1, 1000),
  windowSec: parseIntEnv("AUTH_PARTICIPANT_LOGIN_WINDOW_SEC", 60, 1, 86_400),
};

const sessionPolicy = {
  maxAge: parseIntEnv("AUTH_SESSION_MAX_AGE_SEC", 60 * 60 * 24 * 7, 60, 60 * 60 * 24 * 365),
  updateAge: parseIntEnv("AUTH_SESSION_UPDATE_AGE_SEC", 60 * 60 * 24, 60, 60 * 60 * 24 * 30),
};

function parseIntEnv(name: string, fallback: number, min: number, max: number) {
  const raw = process.env[name];
  if (!raw) {
    return fallback;
  }

  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  const value = Math.trunc(parsed);
  return Math.max(min, Math.min(max, value));
}

function normalizeEmail(input: string | null | undefined) {
  const value = input?.trim().toLowerCase();
  if (!value) {
    return null;
  }
  return value;
}

function buildAdminDenyRedirect(error: string) {
  return `/auth/admin?error=${encodeURIComponent(error)}`;
}

function extractRequestHeader(
  headers: Headers | Record<string, string | string[] | undefined> | undefined,
  key: string,
) {
  if (!headers) {
    return null;
  }

  if (headers instanceof Headers) {
    return headers.get(key);
  }

  const directValue = headers[key] ?? headers[key.toLowerCase()];
  if (Array.isArray(directValue)) {
    return directValue[0] ?? null;
  }
  return directValue ?? null;
}

function resolveLoginIp(headers: Headers | Record<string, string | string[] | undefined> | undefined) {
  const fromForwarded = extractRequestHeader(headers, "x-forwarded-for");
  if (fromForwarded) {
    const first = fromForwarded.split(",")[0]?.trim();
    if (first) {
      return first.toLowerCase();
    }
  }

  const fromRealIp = extractRequestHeader(headers, "x-real-ip");
  if (fromRealIp?.trim()) {
    return fromRealIp.trim().toLowerCase();
  }

  return "unknown";
}

async function checkParticipantLoginRateLimit(params: {
  loginId: string;
  headers: Headers | Record<string, string | string[] | undefined> | undefined;
}) {
  const ip = resolveLoginIp(params.headers);
  const decision = await consumeRateLimit({
    bucketKey: `auth:participant-login:${ip}:${params.loginId.toLowerCase()}`,
    limit: participantLoginRateLimit.limit,
    windowSec: participantLoginRateLimit.windowSec,
  });

  if (!decision.allowed) {
    throw new Error(`rate_limited:${decision.retryAfterSec}`);
  }
}

async function validateGoogleAdminSignIn(params: {
  googleSub: string;
  email: string | null;
  displayName: string;
}) {
  const now = new Date();

  const byGoogleSub = await prisma.user.findUnique({
    where: { googleSub: params.googleSub },
    select: {
      id: true,
      role: true,
      isActive: true,
    },
  });

  if (byGoogleSub) {
    if (
      byGoogleSub.role !== UserRole.RESEARCH_ADMIN &&
      byGoogleSub.role !== UserRole.PLATFORM_ADMIN
    ) {
      return buildAdminDenyRedirect("account_role_not_admin");
    }
    if (!byGoogleSub.isActive) {
      return buildAdminDenyRedirect("admin_inactive");
    }

    await prisma.user.update({
      where: { id: byGoogleSub.id },
      data: {
        email: params.email,
        displayName: params.displayName,
        disabledReason: null,
        lastLoginAt: now,
      },
    });
    return true;
  }

  if (!params.email) {
    return buildAdminDenyRedirect("admin_email_required");
  }

  const byEmail = await prisma.user.findUnique({
    where: { email: params.email },
    select: {
      id: true,
      role: true,
      isActive: true,
    },
  });

  if (byEmail) {
    if (byEmail.role !== UserRole.RESEARCH_ADMIN && byEmail.role !== UserRole.PLATFORM_ADMIN) {
      return buildAdminDenyRedirect("account_role_not_admin");
    }
    if (!byEmail.isActive) {
      return buildAdminDenyRedirect("admin_inactive");
    }

    await prisma.user.update({
      where: { id: byEmail.id },
      data: {
        googleSub: params.googleSub,
        displayName: params.displayName,
        lastLoginAt: now,
        disabledReason: null,
      },
    });
    return true;
  }

  if (bootstrapPlatformAdminEmails.has(params.email)) {
    await prisma.user.create({
      data: {
        role: UserRole.PLATFORM_ADMIN,
        email: params.email,
        googleSub: params.googleSub,
        displayName: params.displayName,
        locale: Locale.ko,
        isActive: true,
        lastLoginAt: now,
      },
    });
    return true;
  }

  const invite = await prisma.adminInvite.findFirst({
    where: {
      email: params.email,
      status: AdminInviteStatus.PENDING,
      expiresAt: { gt: now },
      revokedAt: null,
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      role: true,
    },
  });

  if (!invite) {
    return buildAdminDenyRedirect("admin_not_invited");
  }

  if (invite.role !== UserRole.RESEARCH_ADMIN && invite.role !== UserRole.PLATFORM_ADMIN) {
    return buildAdminDenyRedirect("invite_role_invalid");
  }

  await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        role: invite.role,
        email: params.email as string,
        googleSub: params.googleSub,
        displayName: params.displayName,
        locale: Locale.ko,
        isActive: true,
        lastLoginAt: now,
      },
      select: { id: true },
    });

    await tx.adminInvite.update({
      where: { id: invite.id },
      data: {
        status: AdminInviteStatus.ACCEPTED,
        acceptedAt: now,
        acceptedById: created.id,
      },
    });
  });

  return true;
}

async function refreshGoogleTokenClaims(googleSub: string) {
  return prisma.user.findUnique({
    where: { googleSub },
    select: {
      id: true,
      role: true,
      locale: true,
      displayName: true,
      isActive: true,
    },
  });
}

async function refreshTokenClaimsByUserId(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      role: true,
      locale: true,
      displayName: true,
      isActive: true,
    },
  });
}

const participantCredentials = CredentialsProvider({
  id: "participant-credentials",
  name: "Participant",
  credentials: {
    loginId: { label: "ID", type: "text" },
    password: { label: "Password", type: "password" },
  },
  async authorize(credentials, req): Promise<AuthUser | null> {
    const loginId = credentials?.loginId?.trim();
    const password = credentials?.password ?? "";

    if (!loginId || !password) {
      throw new Error("participant_invalid_credentials");
    }

    await checkParticipantLoginRateLimit({
      loginId,
      headers: req?.headers as Headers | Record<string, string | string[] | undefined> | undefined,
    });

    const user = await prisma.user.findUnique({
      where: { loginId },
      select: {
        id: true,
        role: true,
        locale: true,
        displayName: true,
        passwordHash: true,
        isActive: true,
      },
    });

    if (!user || !user.passwordHash) {
      throw new Error("participant_invalid_credentials");
    }

    if (user.role !== UserRole.PARTICIPANT) {
      throw new Error("participant_invalid_credentials");
    }

    if (!user.isActive) {
      throw new Error("participant_inactive");
    }

    const ok = await compare(password, user.passwordHash);
    if (!ok) {
      throw new Error("participant_invalid_credentials");
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return {
      id: user.id,
      role: user.role,
      locale: user.locale,
      name: user.displayName,
    };
  },
});

const providers: NextAuthOptions["providers"] = [participantCredentials];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  );
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: sessionPolicy.maxAge,
    updateAge: sessionPolicy.updateAge,
  },
  providers,
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider !== "google") {
        return true;
      }

      const googleSub = account.providerAccountId;
      if (!googleSub) {
        return buildAdminDenyRedirect("google_sub_missing");
      }

      const email = normalizeEmail(typeof profile?.email === "string" ? profile.email : null);
      const displayName =
        typeof profile?.name === "string" && profile.name.trim()
          ? profile.name.trim()
          : email ?? "Research Admin";

      try {
        return await validateGoogleAdminSignIn({
          googleSub,
          email,
          displayName,
        });
      } catch {
        return buildAdminDenyRedirect("auth_internal_error");
      }
    },
    async jwt({ token, account, user }) {
      if (account?.provider === "participant-credentials" && user) {
        const participant = user as AuthUser;
        token.uid = participant.id;
        token.role = participant.role;
        token.locale = participant.locale;
        token.name = participant.name ?? token.name;
      }

      if (account?.provider === "google") {
        const googleSub = account.providerAccountId;
        if (googleSub) {
          const dbUser = await refreshGoogleTokenClaims(googleSub);
          if (!dbUser || !dbUser.isActive) {
            delete token.uid;
            delete token.role;
            return token;
          }

          token.uid = dbUser.id;
          token.role = dbUser.role;
          token.locale = dbUser.locale;
          token.name = dbUser.displayName ?? token.name;
        }
      }

      if (!account?.provider && typeof token.uid === "string") {
        const dbUser = await refreshTokenClaimsByUserId(token.uid);
        if (!dbUser || !dbUser.isActive) {
          delete token.uid;
          delete token.role;
          return token;
        }

        token.role = dbUser.role;
        token.locale = dbUser.locale;
        token.name = dbUser.displayName ?? token.name;
      }

      return token;
    },
    async session({ session, token }) {
      if (!session.user) {
        return session;
      }

      if (typeof token.uid === "string") {
        session.user.id = token.uid;
      }
      if (
        token.role === UserRole.PARTICIPANT ||
        token.role === UserRole.RESEARCH_ADMIN ||
        token.role === UserRole.PLATFORM_ADMIN
      ) {
        session.user.role = token.role;
      }
      if (token.locale === Locale.ko || token.locale === Locale.en) {
        session.user.locale = token.locale;
      }

      return session;
    },
  },
  pages: {
    error: "/auth/admin",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

