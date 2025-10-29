import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware Next.js
 * - Protège les routes privées (dashboard, organization, etc.)
 * - Gère les redirections des liens courts
 */

// Routes publiques (pas besoin d'auth)
const publicRoutes = ["/login", "/signup", "/"];

// Routes protégées (nécessitent l'authentification)
const protectedRoutes = ["/dashboard", "/organization", "/link"];

// Routes à ignorer pour la détection de shortCode
const ignoredPaths = [
  "/api",
  "/_next",
  "/favicon.ico",
  "/login",
  "/signup",
  "/dashboard",
  "/organization",
  "/link",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get("session_token")?.value;

  // Ignore les routes spécifiques
  const shouldIgnore = ignoredPaths.some((path) => pathname.startsWith(path));

  if (shouldIgnore) {
    // Protection des routes privées
    const isProtectedRoute = protectedRoutes.some((route) =>
      pathname.startsWith(route)
    );

    // Si route protégée et pas de session, redirige vers login
    if (isProtectedRoute && !sessionToken) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Si route publique (login/signup) et session existante, redirige vers dashboard
    if ((pathname === "/login" || pathname === "/signup") && sessionToken) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  }

  // Si on arrive ici et que pathname n'est pas "/" (homepage)
  // alors c'est potentiellement un shortCode
  if (pathname !== "/" && pathname.length > 1) {
    // Extrait le shortCode (retire le "/" du début)
    const potentialShortCode = pathname.slice(1);

    // Vérifie que c'est un shortCode valide (7 caractères alphanumériques)
    // Si ça ne correspond pas, on laisse Next.js gérer (404)
    const shortCodePattern = /^[a-zA-Z0-9]{7}$/;

    if (shortCodePattern.test(potentialShortCode)) {
      // C'est probablement un shortCode, on laisse passer vers la route [shortCode]
      console.log(
        `[Middleware] Potential shortCode detected: ${potentialShortCode}`
      );
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

// Configuration des routes où le middleware s'applique
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
