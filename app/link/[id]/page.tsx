import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/session'
import { db } from '@/lib/prisma'
import { buildShortUrl } from '@/lib/links'
import { Navbar } from '@/app/components/layout/navbar'
import { Card, CardContent } from '@/app/components/ui/Card'
import { LinkStatsClient } from '@/app/components/links/LinkStatsClient'
import { ExternalLink } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { RefreshButton } from '@/app/components/RefreshButton'


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

    // Fetch link with permission check
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
        <div className="min-h-screen">
            <Navbar user={user} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href={`/organization/${link.organization.slug}`}
                        className="text-sm text-primary-600 hover:text-primary-700 mb-2 inline-block"
                    >
                        ← Back to Organization
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{link.name}</h1>
                    <div className="flex items-center justify-between gap-3 text-sm text-gray-600">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <a
                                    href={shortUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-primary-600 transition-colors"
                                >
                                    <code className="py-1 rounded">{shortUrl}</code>
                                </a>
                                <a
                                    href={shortUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-500 hover:text-primary-600 transition-colors"
                                >
                                    <ExternalLink size={16} />
                                </a>
                            </div>
                            <Separator orientation='vertical' className="text-gray-500 bg-gray-300 h-4" />
                            <span
                                className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-full ${link.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                    }`}
                            >
                                <span className={`w-2 h-2 rounded-full ${link.isActive ? 'bg-green-600' : 'bg-red-600'}`}></span>
                                {link.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        <RefreshButton />
                    </div>
                </div>

                {/* Statistics (client component) */}
                <LinkStatsClient linkId={id} linkUrl={link.originalUrl} />
            </main>
        </div>
    )
}
