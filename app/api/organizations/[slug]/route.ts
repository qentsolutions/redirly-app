import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/lib/prisma";

/**
 * GET /api/organizations/[slug]
 * Récupère une organisation par son slug
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { slug } = await params;

    // Récupère l'organisation avec vérification des permissions
    const organization = await db.organization.findUnique({
      where: { slug },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            links: true,
          },
        },
      },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organisation non trouvée" },
        { status: 404 }
      );
    }

    // Vérifie que l'utilisateur est membre de l'organisation
    const isMember = organization.members.some(
      (m: any) => m.userId === user.id
    );

    if (!isMember) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 }
      );
    }

    return NextResponse.json({ organization });
  } catch (error) {
    console.error("Get organization error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'organisation" },
      { status: 500 }
    );
  }
}
