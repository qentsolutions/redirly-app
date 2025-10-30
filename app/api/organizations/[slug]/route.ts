import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/lib/prisma";

/**
 * GET /api/organizations/[slug]
 * Retrieves an organization by its slug
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { slug } = await params;

    // Retrieve organization with permission check
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
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    // Check that user is a member of the organization
    const isMember = organization.members.some(
      (m: any) => m.userId === user.id
    );

    if (!isMember) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 }
      );
    }

    return NextResponse.json({ organization });
  } catch (error) {
    console.error("Get organization error:", error);
    return NextResponse.json(
      { error: "Error retrieving organization" },
      { status: 500 }
    );
  }
}
