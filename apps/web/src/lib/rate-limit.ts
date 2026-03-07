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

function isRetryableRateLimitError(error: unknown): boolean {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = (error as { code?: unknown }).code;
    return code === "P2002" || code === "P2028" || code === "P2034";
  }
  return false;
}

export async function consumeRateLimit(input: RateLimitInput): Promise<RateLimitDecision> {
  validate(input);

  const now = new Date();
  const windowStart = getWindowStart(now, input.windowSec);
  const windowEnd = new Date(windowStart.getTime() + input.windowSec * 1000);

  let attempts = 0;
  while (attempts < 5) {
    try {
      const existing = await prisma.rateLimitBucket.findUnique({
        where: { bucketKey: input.bucketKey },
        select: {
          id: true,
          windowStart: true,
          hitCount: true,
        },
      });

      if (!existing) {
        await prisma.rateLimitBucket.create({
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
        const reset = await prisma.rateLimitBucket.updateMany({
          where: {
            id: existing.id,
            windowStart: existing.windowStart,
          },
          data: {
            windowStart,
            hitCount: 1,
          },
        });

        if (reset.count === 1) {
          return {
            allowed: true,
            retryAfterSec: 0,
            remaining: Math.max(input.limit - 1, 0),
            limit: input.limit,
            resetAt: windowEnd.toISOString(),
          };
        }

        continue;
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

      const updated = await prisma.rateLimitBucket.updateMany({
        where: {
          id: existing.id,
          windowStart,
          hitCount: existing.hitCount,
        },
        data: {
          hitCount: {
            increment: 1,
          },
        },
      });

      if (updated.count === 1) {
        return {
          allowed: true,
          retryAfterSec: 0,
          remaining: Math.max(input.limit - (existing.hitCount + 1), 0),
          limit: input.limit,
          resetAt: windowEnd.toISOString(),
        };
      }
    } catch (error) {
      attempts += 1;
      if (!isRetryableRateLimitError(error) || attempts >= 5) {
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
