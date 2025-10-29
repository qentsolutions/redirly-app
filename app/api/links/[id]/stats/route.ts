import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/lib/prisma";

/**
 * GET /api/links/[id]/stats
 * Récupère les statistiques détaillées d'un lien
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { id } = await params;

    // Récupère le paramètre de période (par défaut: 30)
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30";

    // Vérifie les permissions
    const link = await db.link.findUnique({
      where: { id },
      include: {
        organization: {
          include: {
            members: {
              where: {
                userId: user.id,
              },
            },
          },
        },
      },
    });

    if (!link || link.organization.members.length === 0) {
      return NextResponse.json(
        { error: "Lien non trouvé ou accès refusé" },
        { status: 404 }
      );
    }

    // Calcule la date de début selon la période
    const startDate = new Date();
    switch (period) {
      case "1": // 24 heures
        startDate.setHours(startDate.getHours() - 24);
        break;
      case "7": // 7 jours
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "30": // 30 jours
      default:
        startDate.setDate(startDate.getDate() - 30);
        break;
    }

    // Statistiques globales
    const totalClicks = await db.click.count({
      where: { linkId: id },
    });

    const recentClicks = await db.click.count({
      where: {
        linkId: id,
        timestamp: {
          gte: startDate,
        },
      },
    });

    // Clics par jour/heure selon la période
    let clicksByDay: Array<{ date: string; count: bigint }>;

    if (period === "1") {
      // Pour 24 heures, grouper par heure
      clicksByDay = await db.$queryRaw<Array<{ date: string; count: bigint }>>`
        SELECT
          TO_CHAR(DATE_TRUNC('hour', timestamp), 'YYYY-MM-DD HH24:00') as date,
          COUNT(*) as count
        FROM clicks
        WHERE "linkId" = ${id}
          AND timestamp >= ${startDate}
        GROUP BY DATE_TRUNC('hour', timestamp)
        ORDER BY DATE_TRUNC('hour', timestamp) ASC
      `;
    } else {
      // Pour 7 et 30 jours, grouper par jour
      clicksByDay = await db.$queryRaw<Array<{ date: string; count: bigint }>>`
        SELECT
          DATE(timestamp) as date,
          COUNT(*) as count
        FROM clicks
        WHERE "linkId" = ${id}
          AND timestamp >= ${startDate}
        GROUP BY DATE(timestamp)
        ORDER BY date ASC
      `;
    }

    // Clics par pays
    const clicksByCountry = await db.click.groupBy({
      by: ["country"],
      where: {
        linkId: id,
        country: {
          not: null,
        },
      },
      _count: {
        country: true,
      },
      orderBy: {
        _count: {
          country: "desc",
        },
      },
      take: 10,
    });

    // Clics par device
    const clicksByDevice = await db.click.groupBy({
      by: ["device"],
      where: {
        linkId: id,
        device: {
          not: null,
        },
      },
      _count: {
        device: true,
      },
    });

    // Clics par navigateur
    const clicksByBrowser = await db.click.groupBy({
      by: ["browser"],
      where: {
        linkId: id,
        browser: {
          not: null,
        },
      },
      _count: {
        browser: true,
      },
      orderBy: {
        _count: {
          browser: "desc",
        },
      },
      take: 5,
    });

    // Clics par OS
    const clicksByOS = await db.click.groupBy({
      by: ["os"],
      where: {
        linkId: id,
        os: {
          not: null,
        },
      },
      _count: {
        os: true,
      },
      orderBy: {
        _count: {
          os: "desc",
        },
      },
      take: 5,
    });

    return NextResponse.json({
      stats: {
        totalClicks,
        recentClicks,
        clicksByDay: clicksByDay.map((d) => ({
          date: d.date,
          count: Number(d.count),
        })),
        clicksByCountry: clicksByCountry.map((c) => ({
          country: c.country,
          count: c._count.country,
        })),
        clicksByDevice: clicksByDevice.map((d) => ({
          device: d.device,
          count: d._count.device,
        })),
        clicksByBrowser: clicksByBrowser.map((b) => ({
          browser: b.browser,
          count: b._count.browser,
        })),
        clicksByOS: clicksByOS.map((o) => ({
          os: o.os,
          count: o._count.os,
        })),
      },
    });
  } catch (error) {
    console.error("Get link stats error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des statistiques" },
      { status: 500 }
    );
  }
}
