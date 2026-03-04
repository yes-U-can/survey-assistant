import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

type RateLimitInput = {
  bucketKey: string;
  limit: number;
  windowSec: number;
};

export type RateLimitDecision = {
  allowed: boolean;
  retryAfterSec: number;
  remaining: number;
  limit: number;
  resetAt: string;
};

function validate(input: RateLimitInput) {
  if (!Number.isInteger(input.limit) || input.limit < 1 || input.limit > 1_000_000) {
    throw new Error("invalid_rate_limit_limit");
  }
  if (!Number.isInteger(input.windowSec) || input.windowSec < 1 || input.windowSec > 86_400) {
    throw new Error("invalid_rate_limit_window");
  }
  if (!input.bucketKey.trim()) {
    throw new Error("invalid_rate_limit_bucket_key");
  }
}

function getWindowStart(now: Date, windowSec: number) {
  const windowMs = windowSec * 1000;
  return new Date(Math.floor(now.getTime() / windowMs) * windowMs);
}

function isSerializableRetryError(error: unknown): boolean {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = (error as { code?: unknown }).code;
    return code === "P2034";
  }
  return false;
}

export async function consumeRateLimit(input: RateLimitInput): Promise<RateLimitDecision> {
  validate(input);

  const now = new Date();
  const windowStart = getWindowStart(now, input.windowSec);
  const windowEnd = new Date(windowStart.getTime() + input.windowSec * 1000);

  let attempts = 0;
  while (attempts < 3) {
    try {
      return await prisma.$transaction(
        async (tx) => {
          const existing = await tx.rateLimitBucket.findUnique({
            where: { bucketKey: input.bucketKey },
            select: {
              id: true,
              windowStart: true,
              hitCount: true,
            },
          });

          if (!existing) {
            await tx.rateLimitBucket.create({
              data: {
                bucketKey: input.bucketKey,
                windowStart,
                hitCount: 1,
              },
            });
            return {
              allowed: true,
              retryAfterSec: 0,
              remaining: Math.max(input.limit - 1, 0),
              limit: input.limit,
              resetAt: windowEnd.toISOString(),
            };
          }

          if (existing.windowStart.getTime() !== windowStart.getTime()) {
            await tx.rateLimitBucket.update({
              where: { id: existing.id },
              data: {
                windowStart,
                hitCount: 1,
              },
            });
            return {
              allowed: true,
              retryAfterSec: 0,
              remaining: Math.max(input.limit - 1, 0),
              limit: input.limit,
              resetAt: windowEnd.toISOString(),
            };
          }

          if (existing.hitCount >= input.limit) {
            const retryAfterSec = Math.max(
              Math.ceil((windowEnd.getTime() - now.getTime()) / 1000),
              1,
            );
            return {
              allowed: false,
              retryAfterSec,
              remaining: 0,
              limit: input.limit,
              resetAt: windowEnd.toISOString(),
            };
          }

          const updated = await tx.rateLimitBucket.update({
            where: { id: existing.id },
            data: {
              hitCount: { increment: 1 },
            },
            select: { hitCount: true },
          });

          return {
            allowed: true,
            retryAfterSec: 0,
            remaining: Math.max(input.limit - updated.hitCount, 0),
            limit: input.limit,
            resetAt: windowEnd.toISOString(),
          };
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error) {
      attempts += 1;
      if (!isSerializableRetryError(error) || attempts >= 3) {
        throw error;
      }
    }
  }

  return {
    allowed: false,
    retryAfterSec: 1,
    remaining: 0,
    limit: input.limit,
    resetAt: windowEnd.toISOString(),
  };
}

export function getRequestIp(request: Request) {
  const fromForwarded = request.headers.get("x-forwarded-for");
  if (fromForwarded) {
    const first = fromForwarded.split(",")[0]?.trim();
    if (first) {
      return first.toLowerCase();
    }
  }

  const fromRealIp = request.headers.get("x-real-ip");
  if (fromRealIp?.trim()) {
    return fromRealIp.trim().toLowerCase();
  }

  return "unknown";
}

export function rateLimitedResponse(retryAfterSec: number) {
  return NextResponse.json(
    {
      ok: false,
      error: "rate_limited",
      retryAfterSec,
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfterSec),
      },
    },
  );
}
