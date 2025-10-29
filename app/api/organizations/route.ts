import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import { createUniqueSlug } from '@/lib/links'
import { db } from '@/lib/prisma'
import { createOrganizationSchema } from '@/lib/validation'

/**
 * POST /api/organizations
 * Crée une nouvelle organisation
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const result = createOrganizationSchema.safeParse(body)
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: result.error.flatten() },
        { status: 400 }
      )
    }

    const { name, description } = result.data

    // Génère un slug unique
    const slug = await createUniqueSlug(name)

    // Crée l'organisation
    const organization = await db.organization.create({
      data: {
        name,
        slug,
        description: description || null,
        ownerId: user.id,
        members: {
          create: {
            userId: user.id,
            role: 'owner',
          },
        },
      },
    })

    return NextResponse.json({ organization })
  } catch (error) {
    console.error('Create organization error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'organisation' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/organizations
 * Liste les organisations de l'utilisateur
 */
export async function GET() {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Récupère toutes les organisations où l'utilisateur est membre
    const organizations = await db.organization.findMany({
      where: {
        members: {
          some: {
            userId: user.id,
          },
        },
      },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        _count: {
          select: {
            links: true,
            members: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ organizations })
  } catch (error) {
    console.error('Get organizations error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des organisations' },
      { status: 500 }
    )
  }
}