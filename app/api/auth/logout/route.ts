import { NextRequest, NextResponse } from "next/server";
import { getSessionToken, deleteSessionCookie } from "@/lib/session";
import { deleteSession } from "@/lib/auth";

/**
 * POST /api/auth/logout
 * Logs out the user and deletes the session
 */
export async function POST(request: NextRequest) {
  try {
    const token = await getSessionToken();

    if (token) {
      // Delete session from database
      await deleteSession(token);
    }

    // Delete cookie
    await deleteSessionCookie();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Error during logout" },
      { status: 500 }
    );
  }
}
