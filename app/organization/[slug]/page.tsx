import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/session'
import { db } from '@/lib/prisma'
import { buildShortUrl } from '@/lib/links'
import { Navbar } from '@/app/components/layout/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/Card'
import { CreateLinkModal } from '@/app/components/links/CreateLinkModal'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/Table'
import { Button } from '@/app/components/ui/Button'
import { LinkCard } from '@/app/components/LinkCard'
import { CreateLinkButton } from '@/app/components/CreateLinkButton'

interface PageProps {
    params: Promise<{
        slug: string
    }>
}

export default async function OrganizationPage({ params }: PageProps) {
    const user = await getCurrentUser()
    const { slug } = await params

    if (!user) {
        redirect('/login')
    }

    // Récupère l'organisation avec vérification des permissions
    const organization = await db.organization.findUnique({
        where: { slug },
        include: {
            members: {
                where: {
                    userId: user.id,
                },
            },
        },
    })

    if (!organization || organization.members.length === 0) {
        redirect('/dashboard')
    }

    // Récupère les liens de l'organisation
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
            createdAt: 'desc',
        },
    })

    // Statistiques
    const totalClicks = links.reduce((sum, link) => sum + link._count.clicks, 0)
    const activeLinks = links.filter(link => link.isActive).length

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar user={user} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* En-tête */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <Link href="/dashboard" className="text-sm text-primary-600 hover:text-primary-700 mb-2 inline-block">
                                ← Retour au dashboard
                            </Link>
                            <h1 className="text-3xl font-bold text-gray-900">{organization.name}</h1>
                            {organization.description && (
                                <p className="text-gray-600 mt-2">{organization.description}</p>
                            )}
                        </div>
                        <CreateLinkButton organizationSlug={slug} size="lg" />
                    </div>
                </div>

                {/* Statistiques */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total de liens</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-1">{links.length}</p>
                                </div>
                                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                    </svg>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Liens actifs</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-1">{activeLinks}</p>
                                </div>
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total de clics</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-1">{totalClicks.toLocaleString()}</p>
                                </div>
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Liste des liens */}
                {links.length === 0 ? (
                    <Card>
                        <CardContent>
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun lien créé</h3>
                                <p className="text-gray-500 mb-6">Commencez par créer votre premier lien court</p>
                                <CreateLinkButton organizationSlug={slug} />
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {links.map((link) => (
                            <LinkCard key={link.id} link={link} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}