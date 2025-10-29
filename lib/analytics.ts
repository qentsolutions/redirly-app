import crypto from "crypto";

/**
 * Utilitaires pour analytics et respect RGPD
 * - Anonymisation des IP
 * - Parsing user-agent
 * - Géolocalisation (via API externe optionnelle)
 */

/**
 * Anonymise une adresse IP en la hachant avec SHA256
 * Conforme RGPD : on ne stocke jamais l'IP brute
 */
export function anonymizeIP(ip: string): string {
  return crypto
    .createHash("sha256")
    .update(ip + process.env.IP_SALT || "default-salt")
    .digest("hex");
}

/**
 * Parse le User-Agent pour extraire device, browser et OS
 */
export function parseUserAgent(userAgent: string | null) {
  if (!userAgent) {
    return { device: "unknown", browser: "unknown", os: "unknown" };
  }

  const ua = userAgent.toLowerCase();

  // Détection du device
  let device = "desktop";
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(userAgent)) {
    device = "tablet";
  } else if (
    /mobile|iphone|ipod|android|blackberry|opera mini|opera mobi|skyfire|maemo|windows phone|palm|iemobile|symbian|symbianos|fennec/i.test(
      userAgent
    )
  ) {
    device = "mobile";
  }

  // Détection du navigateur
  let browser = "unknown";
  if (ua.includes("edg/")) browser = "Edge";
  else if (ua.includes("opr/") || ua.includes("opera")) browser = "Opera";
  else if (ua.includes("chrome")) browser = "Chrome";
  else if (ua.includes("safari") && !ua.includes("chrome")) browser = "Safari";
  else if (ua.includes("firefox")) browser = "Firefox";
  else if (ua.includes("msie") || ua.includes("trident")) browser = "IE";

  // Détection de l'OS
  let os = "unknown";
  if (ua.includes("windows nt 10.0")) os = "Windows 10";
  else if (ua.includes("windows nt 6.3")) os = "Windows 8.1";
  else if (ua.includes("windows nt 6.2")) os = "Windows 8";
  else if (ua.includes("windows nt 6.1")) os = "Windows 7";
  else if (ua.includes("windows")) os = "Windows";
  else if (ua.includes("mac os x")) os = "macOS";
  else if (ua.includes("android")) os = "Android";
  else if (ua.includes("iphone") || ua.includes("ipad")) os = "iOS";
  else if (ua.includes("linux")) os = "Linux";

  return { device, browser, os };
}

/**
 * Obtient la géolocalisation approximative via IP (optionnel)
 * Utilise une API externe comme ip-api.com (gratuit) ou ipapi.co
 * Note : retourne null si pas configuré
 */
export async function getGeolocation(
  ip: string
): Promise<{ country: string | null; city: string | null }> {
  try {
    // API gratuite ip-api.com (150 req/min max)
    const response = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,country,city,countryCode`,
      {
        next: { revalidate: 3600 }, // Cache 1h
      }
    );

    if (!response.ok) {
      return { country: null, city: null };
    }

    const data = await response.json();

    if (data.status === "success") {
      return {
        country: data.countryCode || null,
        city: data.city || null,
      };
    }
  } catch (error) {
    console.error("Geolocation error:", error);
  }

  return { country: null, city: null };
}

/**
 * Extrait l'IP réelle du client en tenant compte des proxies
 */
export function getClientIP(headers: Headers): string | null {
  // Cherche l'IP dans différents headers possibles
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIp = headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  // Fallback (probablement localhost en dev)
  return null;
}
