import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

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

    // Récupère les paramètres
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30";
    const granularity = searchParams.get("granularity") || "daily";
    const customStartDate = searchParams.get("startDate");
    const customEndDate = searchParams.get("endDate");

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
    let startDate = new Date();
    let endDate = new Date();

    if (customStartDate && customEndDate) {
      // Dates personnalisées
      startDate = new Date(customStartDate);
      endDate = new Date(customEndDate);

      if (period === "1" && customStartDate === customEndDate) {
        // Vue horaire pour une seule date
        startDate.setHours(0, 0, 0, 0); // Début du jour
        endDate.setHours(23, 59, 59, 999); // Fin du jour
      } else {
        // Plage de dates
        endDate.setHours(23, 59, 59, 999); // Fin de la journée
      }
    } else {
      // Périodes prédéfinies
      switch (period) {
        case "1": // Aujourd'hui (00:00 à 23:59)
          if (granularity === "hourly") {
            startDate.setHours(0, 0, 0, 0); // Début de la journée
            endDate.setHours(23, 59, 59, 999); // Fin de la journée
          } else {
            startDate.setHours(startDate.getHours() - 24);
          }
          break;
        case "7": // 7 jours
          startDate.setDate(startDate.getDate() - 7);
          break;
        case "30": // 30 jours
        default:
          startDate.setDate(startDate.getDate() - 30);
          break;
      }
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
          ...(customStartDate && customEndDate ? { lte: endDate } : {}),
        },
      },
    });

    // Clics par jour/heure/semaine selon la granularité
    let clicksByDay: Array<{ date: string; count: bigint }>;

    if (granularity === "hourly") {
      // Pour la vue horaire, grouper par heure
      const rawClicks = await db.$queryRaw<Array<{ date: string; count: bigint }>>`
        SELECT
          TO_CHAR(DATE_TRUNC('hour', timestamp), 'YYYY-MM-DD HH24:MI') as date,
          COUNT(*) as count
        FROM clicks
        WHERE "linkId" = ${id}
          AND timestamp >= ${startDate}
          ${customStartDate && customEndDate ? Prisma.sql`AND timestamp <= ${endDate}` : Prisma.empty}
        GROUP BY DATE_TRUNC('hour', timestamp)
        ORDER BY DATE_TRUNC('hour', timestamp) ASC
      `;

      // Remplir toutes les heures manquantes avec 0
      const clicksMap = new Map(rawClicks.map(c => [c.date, c.count]));
      clicksByDay = [];

      const current = new Date(startDate);
      current.setMinutes(0, 0, 0);
      const end = new Date(endDate);

      // Ne pas aller au-delà de l'heure actuelle
      const now = new Date();
      const maxDate = end < now ? end : now;

      while (current <= maxDate) {
        const dateStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')} ${String(current.getHours()).padStart(2, '0')}:00`;
        clicksByDay.push({
          date: dateStr,
          count: clicksMap.get(dateStr) || BigInt(0)
        });
        current.setHours(current.getHours() + 1);
      }
    } else if (granularity === "weekly") {
      // Pour la vue hebdomadaire, grouper par semaine
      clicksByDay = await db.$queryRaw<Array<{ date: string; count: bigint }>>`
        SELECT
          TO_CHAR(DATE_TRUNC('week', timestamp), 'YYYY-MM-DD') as date,
          COUNT(*) as count
        FROM clicks
        WHERE "linkId" = ${id}
          AND timestamp >= ${startDate}
          ${customStartDate && customEndDate ? Prisma.sql`AND timestamp <= ${endDate}` : Prisma.empty}
        GROUP BY DATE_TRUNC('week', timestamp)
        ORDER BY DATE_TRUNC('week', timestamp) ASC
      `;
    } else {
      // Pour la vue journalière (par défaut), grouper par jour
      const rawClicks = await db.$queryRaw<Array<{ date: string; count: bigint }>>`
        SELECT
          DATE(timestamp) as date,
          COUNT(*) as count
        FROM clicks
        WHERE "linkId" = ${id}
          AND timestamp >= ${startDate}
          ${customStartDate && customEndDate ? Prisma.sql`AND timestamp <= ${endDate}` : Prisma.empty}
        GROUP BY DATE(timestamp)
        ORDER BY date ASC
      `;

      // Remplir tous les jours manquants avec 0
      const clicksMap = new Map(rawClicks.map(c => [c.date, c.count]));
      clicksByDay = [];

      const current = new Date(startDate);
      current.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(0, 0, 0, 0);

      while (current <= end) {
        const dateStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;
        clicksByDay.push({
          date: dateStr,
          count: clicksMap.get(dateStr) || BigInt(0)
        });
        current.setDate(current.getDate() + 1);
      }
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
