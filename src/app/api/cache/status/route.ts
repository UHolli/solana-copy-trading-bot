import { NextResponse } from "next/server";

import { checkCacheHealth } from "@/lib/cache";
import { AppError, serializeAppError } from "@/lib/errors";

export const runtime = "nodejs";

/** GET /api/cache/status — report active cache backend health. */
export async function GET(): Promise<NextResponse> {
  try {
    const health = await checkCacheHealth();
    const status = health.healthy ? 200 : 503;

    return NextResponse.json(
      {
        data: health,
        timestamp: new Date().toISOString(),
      },
      { status },
    );
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(serializeAppError(error), {
        status: error.statusCode,
      });
    }

    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Unexpected error while checking cache health",
        },
      },
      { status: 500 },
    );
  }
}
