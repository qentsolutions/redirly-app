import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import {
  anonymizeIP,
  parseUserAgent,
  getGeolocation,
  getClientIP,
} from "@/lib/analytics";

/**
 * GET /[shortCode]
 * Redirige vers l'URL originale et enregistre le clic
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shortCode: string }> }
) {
  try {
    const { shortCode } = await params;

    // Récupère le lien
    const link = await db.link.findUnique({
      where: {
        shortCode,
        isActive: true,
      },
    });

    if (!link) {
      return NextResponse.json({ error: "Lien non trouvé" }, { status: 404 });
    }

    // Collecte les données analytics (de manière asynchrone pour ne pas ralentir la redirection)
    const headers = request.headers;
    const userAgent = headers.get("user-agent");
    const referer = headers.get("referer") || null;
    const clientIP = getClientIP(headers);

    // Enregistre le clic de manière asynchrone
    // On ne bloque pas la redirection pour attendre l'insertion en DB
    const recordClick = async () => {
      try {
        const { device, browser, os } = parseUserAgent(userAgent);

        // Géolocalisation (si IP disponible)
        let country = null;
        let city = null;

        if (clientIP) {
          const geo = await getGeolocation(clientIP);
          country = geo.country;
          city = geo.city;
        }

        await db.click.create({
          data: {
            linkId: link.id,
            ipHash: clientIP ? anonymizeIP(clientIP) : null,
            country,
            city,
            device,
            browser,
            os,
            referer,
          },
        });
      } catch (error) {
        console.error("Error recording click:", error);
      }
    };

    // Lance l'enregistrement en background
    recordClick();

    // Redirige immédiatement
    return NextResponse.redirect(link.originalUrl, { status: 302 });
  } catch (error) {
    console.error("Redirect error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la redirection" },
      { status: 500 }
    );
  }
}
