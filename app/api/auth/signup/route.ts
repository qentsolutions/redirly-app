import { NextRequest, NextResponse } from "next/server";
import { createUser, findUserByEmail, createSession } from "@/lib/auth";
import { setSessionCookie } from "@/lib/session";
import { createUniqueSlug } from "@/lib/links";
import { signupSchema } from "@/lib/validation";
import { db } from "@/lib/prisma";

/**
 * POST /api/auth/signup
 * Crée un nouvel utilisateur et sa première organisation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation des données
    const result = signupSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Données invalides", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { email, password, name } = result.data;

    // Vérifie si l'utilisateur existe déjà
    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      return NextResponse.json(
        { error: "Un compte avec cet email existe déjà" },
        { status: 409 }
      );
    }

    // Crée l'utilisateur
    const user = await createUser(email, password, name);

    // Crée une organisation par défaut pour l'utilisateur
    const orgName = name || email.split("@")[0];
    const slug = await createUniqueSlug(orgName);

    await db.organization.create({
      data: {
        name: `Organisation de ${orgName}`,
        slug,
        ownerId: user.id,
        members: {
          create: {
            userId: user.id,
            role: "owner",
          },
        },
      },
    });

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
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du compte" },
      { status: 500 }
    );
  }
}
