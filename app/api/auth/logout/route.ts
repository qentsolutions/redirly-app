import { NextRequest, NextResponse } from "next/server";
import { getSessionToken, deleteSessionCookie } from "@/lib/session";
import { deleteSession } from "@/lib/auth";

/**
 * POST /api/auth/logout
 * Déconnecte l'utilisateur et supprime la session
 */
export async function POST(request: NextRequest) {
  try {
    const token = await getSessionToken();

    if (token) {
      // Supprime la session de la base de données
      await deleteSession(token);
    }

    // Supprime le cookie
    await deleteSessionCookie();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la déconnexion" },
      { status: 500 }
    );
  }
}
