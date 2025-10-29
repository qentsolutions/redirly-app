import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import { buildShortUrl } from '@/lib/links'
import { db } from '@/lib/prisma'
import QRCode from 'qrcode'

/**
 * GET /api/links/[id]/qrcode
 * Génère un QR code pour le lien court
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const { id } = await params

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
    })

    if (!link || link.organization.members.length === 0) {
      return NextResponse.json(
        { error: 'Lien non trouvé ou accès refusé' },
        { status: 404 }
      )
    }

    // Construit l'URL courte
    const shortUrl = buildShortUrl(link.shortCode, link.customDomain)

    // Génère le QR code en data URL
    const qrCodeDataUrl = await QRCode.toDataURL(shortUrl, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 300,
    })

    return NextResponse.json({
      qrCode: qrCodeDataUrl,
      shortUrl,
    })
  } catch (error) {
    console.error('Generate QR code error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la génération du QR code' },
      { status: 500 }
    )
  }
}