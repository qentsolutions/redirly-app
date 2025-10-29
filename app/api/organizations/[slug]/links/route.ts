import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { createUniqueShortCode, isValidUrl } from "@/lib/links";
import { db } from "@/lib/prisma";
import { createLinkSchema } from "@/lib/validation";

/**
 * POST /api/organizations/[slug]/links
 * Crée un nouveau lien dans une organisation
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { slug } = await params;
    const body = await request.json();

    // Validation des données
    const result = createLinkSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Données invalides", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { name, originalUrl, customDomain } = result.data;

    // Vérifie que l'URL est valide
    if (!isValidUrl(originalUrl)) {
      return NextResponse.json({ error: "URL invalide" }, { status: 400 });
    }

    // Vérifie que l'organisation existe et que l'utilisateur en est membre
    const organization = await db.organization.findUnique({
      where: { slug },
      include: {
        members: {
          where: {
            userId: user.id,
          },
        },
      },
    });

    if (!organization || organization.members.length === 0) {
      return NextResponse.json(
        { error: "Organisation non trouvée ou accès refusé" },
        { status: 404 }
      );
    }

    // Génère un code court unique
    const shortCode = await createUniqueShortCode();

    // Crée le lien
    const link = await db.link.create({
      data: {
        name,
        originalUrl,
        shortCode,
        customDomain: customDomain || null,
        organizationId: organization.id,
      },
    });

    return NextResponse.json({ link });
  } catch (error) {
    console.error("Create link error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du lien" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/organizations/[slug]/links
 * Liste les liens d'une organisation
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

    // Vérifie que l'organisation existe et que l'utilisateur en est membre
    const organization = await db.organization.findUnique({
      where: { slug },
      include: {
        members: {
          where: {
            userId: user.id,
          },
        },
      },
    });

    if (!organization || organization.members.length === 0) {
      return NextResponse.json(
        { error: "Organisation non trouvée ou accès refusé" },
        { status: 404 }
      );
    }

    // Récupère les liens avec statistiques
    const links = await db.link.findMany({
      where: {
        organizationId: organization.id,
      },
      include: {
        _count: {
          select: {
            clicks: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ links });
  } catch (error) {
    console.error("Get links error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des liens" },
      { status: 500 }
    );
  }
}
