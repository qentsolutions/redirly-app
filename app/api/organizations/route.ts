import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import { createUniqueSlug } from '@/lib/links'
import { db } from '@/lib/prisma'
import { createOrganizationSchema } from '@/lib/validation'

/**
 * POST /api/organizations
 * Creates a new organization
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const result = createOrganizationSchema.safeParse(body)
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: result.error.flatten() },
        { status: 400 }
      )
    }

    const { name, description } = result.data

    // Generate unique slug
    const slug = await createUniqueSlug(name)

    // Create organization
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
      { error: 'Error creating organization' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/organizations
 * Lists the user's organizations
 */
export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Get all organizations where user is a member
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
      { error: 'Error retrieving organizations' },
      { status: 500 }
    )
  }
}