import { Locale, UserRole } from "@prisma/client";
import { compare } from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

import { prisma } from "@/lib/prisma";

type AuthUser = {
  id: string;
  role: UserRole;
  locale: Locale;
  name?: string | null;
};

const participantCredentials = CredentialsProvider({
  id: "participant-credentials",
  name: "Participant",
  credentials: {
    loginId: { label: "ID", type: "text" },
    password: { label: "Password", type: "password" },
  },
  async authorize(credentials): Promise<AuthUser | null> {
    const loginId = credentials?.loginId?.trim();
    const password = credentials?.password ?? "";

    if (!loginId || !password) {
      return null;
    }

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

    if (!user || !user.passwordHash || !user.isActive) {
      return null;
    }

    if (user.role !== UserRole.PARTICIPANT) {
      return null;
    }

    const ok = await compare(password, user.passwordHash);
    if (!ok) {
      return null;
    }

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
  session: { strategy: "jwt" },
  providers,
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider !== "google") {
        return true;
      }

      const googleSub = account.providerAccountId;
      if (!googleSub) {
        return false;
      }

      const rawName =
        typeof profile?.name === "string"
          ? profile.name
          : typeof profile?.email === "string"
            ? profile.email
            : "Research Admin";

      await prisma.user.upsert({
        where: { googleSub },
        update: {
          displayName: rawName,
          isActive: true,
        },
        create: {
          role: UserRole.RESEARCH_ADMIN,
          googleSub,
          displayName: rawName,
          locale: Locale.ko,
          isActive: true,
        },
      });

      return true;
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
          const dbUser = await prisma.user.findUnique({
            where: { googleSub },
            select: {
              id: true,
              role: true,
              locale: true,
              displayName: true,
            },
          });

          if (dbUser) {
            token.uid = dbUser.id;
            token.role = dbUser.role;
            token.locale = dbUser.locale;
            token.name = dbUser.displayName ?? token.name;
          }
        }
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
      if (token.role === UserRole.PARTICIPANT || token.role === UserRole.RESEARCH_ADMIN || token.role === UserRole.PLATFORM_ADMIN) {
        session.user.role = token.role;
      }
      if (token.locale === Locale.ko || token.locale === Locale.en) {
        session.user.locale = token.locale;
      }

      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

