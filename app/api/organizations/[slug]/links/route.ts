import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { createUniqueShortCode, isValidUrl } from "@/lib/links";
import { db } from "@/lib/prisma";
import { createLinkSchema } from "@/lib/validation";

/**
 * POST /api/organizations/[slug]/links
 * Creates a new link in an organization
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { slug } = await params;
    const body = await request.json();

    // Data validation
    const result = createLinkSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid data", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { name, originalUrl, customDomain } = result.data;

    // Check that URL is valid
    if (!isValidUrl(originalUrl)) {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    // Check that organization exists and user is a member
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
        { error: "Organization not found or access denied" },
        { status: 404 }
      );
    }

    // Generate unique short code
    const shortCode = await createUniqueShortCode();

    // Create link
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
      { error: "Error creating link" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/organizations/[slug]/links
 * Lists the links of an organization
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

    // Check that organization exists and user is a member
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
        { error: "Organization not found or access denied" },
        { status: 404 }
      );
    }

    // Retrieve links with statistics
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
      { error: "Error retrieving links" },
      { status: 500 }
    );
  }
}
