import { NextResponse } from "next/server";

import { getCloneSession, saveCloneSession } from "@/lib/cache";
import { AppError, NotFoundError, serializeAppError } from "@/lib/errors";
import type { CloneSessionRecord } from "@/types/cache";

export const runtime = "nodejs";

interface SessionRequestBody {
  session: CloneSessionRecord;
}

function isCloneSessionRecord(value: unknown): value is CloneSessionRecord {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as CloneSessionRecord;
  return (
    typeof record.id === "string" &&
    typeof record.targetUrl === "string" &&
    typeof record.status === "string" &&
    typeof record.createdAt === "string" &&
    typeof record.updatedAt === "string"
  );
}

/** POST /api/cache/sessions — persist clone session metadata. */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as SessionRequestBody;

    if (!isCloneSessionRecord(body.session)) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Request body must include a valid session object",
          },
        },
        { status: 400 },
      );
    }

    await saveCloneSession(body.session);

    return NextResponse.json({ data: body.session }, { status: 201 });
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
          message: "Unexpected error while saving session",
        },
      },
      { status: 500 },
    );
  }
}

/** GET /api/cache/sessions?id=... — fetch clone session metadata. */
export async function GET(request: Request): Promise<NextResponse> {
  try {
    const sessionId = new URL(request.url).searchParams.get("id");

    if (!sessionId) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Query parameter id is required",
          },
        },
        { status: 400 },
      );
    }

    const session = await getCloneSession(sessionId);
    if (!session) {
      throw new NotFoundError(`Clone session "${sessionId}" was not found`);
    }

    return NextResponse.json({ data: session });
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
          message: "Unexpected error while loading session",
        },
      },
      { status: 500 },
    );
  }
}
