import { NextRequest, NextResponse } from "next/server";
import { createUser, findUserByEmail, createSession } from "@/lib/auth";
import { setSessionCookie } from "@/lib/session";
import { createUniqueSlug } from "@/lib/links";
import { signupSchema } from "@/lib/validation";
import { db } from "@/lib/prisma";

/**
 * POST /api/auth/signup
 * Creates a new user and their first organization
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Data validation
    const result = signupSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid data", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { email, password, name } = result.data;

    // Check if user already exists
    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Create user
    const user = await createUser(email, password, name);

    // Create a default organization for the user
    const orgName = name || email.split("@")[0];
    const slug = await createUniqueSlug(orgName);

    await db.organization.create({
      data: {
        name: `Organization of ${orgName}`,
        slug,
        ownerId: user.id,
        members: {
          create: {
            userId: user.id,
            role: "owner",
          },
        },
      },
    });

    // Create session
    const session = await createSession(user.id);

    // Set session cookie
    await setSessionCookie(session.token);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Error creating account" },
      { status: 500 }
    );
  }
}
