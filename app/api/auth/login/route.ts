import { NextRequest, NextResponse } from "next/server";
import { authenticateUser, createSession } from "@/lib/auth";
import { setSessionCookie } from "@/lib/session";
import { loginSchema } from "@/lib/validation";


/**
 * POST /api/auth/login
 * Authentifie un utilisateur et crée une session
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation des données
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Données invalides", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { email, password } = result.data;

    // Authentifie l'utilisateur
    const user = await authenticateUser(email, password);

    if (!user) {
      return NextResponse.json(
        { error: "Email ou mot de passe incorrect" },
        { status: 401 }
      );
    }

    // Crée une session
    const session = await createSession(user.id);

    // Définit le cookie de session
    await setSessionCookie(session.token);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la connexion" },
      { status: 500 }
    );
  }
}
