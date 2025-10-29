import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";

/**
 * GET /api/auth/me
 * Retourne les informations de l'utilisateur connecté
 */
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'utilisateur" },
      { status: 500 }
    );
  }
}
