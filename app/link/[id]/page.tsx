import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/session'
import { db } from '@/lib/prisma'
import { buildShortUrl } from '@/lib/links'
import { Navbar } from '@/app/components/layout/navbar'
import { Card, CardContent } from '@/app/components/ui/Card'
import { LinkStatsClient } from '@/app/components/links/LinkStatsClient'


interface PageProps {
    params: Promise<{
        id: string
    }>
}

export default async function LinkStatsPage({ params }: PageProps) {
    const user = await getCurrentUser()
    const { id } = await params

    if (!user) {
        redirect('/login')
    }

    // Récupère le lien avec vérification des permissions
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
            _count: {
                select: {
                    clicks: true,
                },
            },
        },
    })

    if (!link || link.organization.members.length === 0) {
        redirect('/dashboard')
    }

    const shortUrl = buildShortUrl(link.shortCode, link.customDomain)

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar user={user} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* En-tête */}
                <div className="mb-8">
                    <Link
                        href={`/organization/${link.organization.slug}`}
                        className="text-sm text-primary-600 hover:text-primary-700 mb-2 inline-block"
                    >
                        ← Retour à l'organisation
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{link.name}</h1>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Lien court: <code className="bg-gray-100 px-2 py-1 rounded">{shortUrl}</code></span>
                        <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${link.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                }`}
                        >
                            {link.isActive ? 'Actif' : 'Inactif'}
                        </span>
                    </div>
                </div>

                {/* Info du lien */}
                <Card className="mb-8">
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">URL de destination</p>
                                <a
                                    href={link.originalUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary-600 hover:text-primary-700 break-all"
                                >
                                    {link.originalUrl}
                                </a>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Total de clics</p>
                                <p className="text-2xl font-bold text-gray-900">{link._count.clicks}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Statistiques (composant client) */}
                <LinkStatsClient linkId={id} />
            </main>
        </div>
    )
}
