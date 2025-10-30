import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { buildShortUrl } from "@/lib/links";
import { db } from "@/lib/prisma";
import QRCode from "qrcode";

/**
 * GET /api/links/[id]/qrcode
 * Generates a QR code for the short link
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id } = await params;

    // Check permissions
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
        { error: "Link not found or access denied" },
        { status: 404 }
      );
    }

    // Build short URL
    const shortUrl = buildShortUrl(link.shortCode, link.customDomain);

    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(shortUrl, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 300,
    });

    return NextResponse.json({
      qrCode: qrCodeDataUrl,
      shortUrl,
    });
  } catch (error) {
    console.error("Generate QR code error:", error);
    return NextResponse.json(
      { error: "Error generating QR code" },
      { status: 500 }
    );
  }
}
