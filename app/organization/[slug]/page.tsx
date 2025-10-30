import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Link2, CheckCircle2, Eye, ArrowLeft, Plus, ExternalLink } from 'lucide-react'
import { getCurrentUser } from '@/lib/session'
import { db } from '@/lib/prisma'
import { buildShortUrl } from '@/lib/links'
import { Navbar } from '@/app/components/layout/navbar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { StatsCard } from '@/components/ui/stats-card'
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

    // Fetch organization with permission check
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

    // Fetch organization links
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

    // Statistics
    const totalClicks = links.reduce((sum, link) => sum + link._count.clicks, 0)
    const activeLinks = links.filter(link => link.isActive).length

    return (
        <div className="min-h-screen bg-background">
            <Navbar user={user} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
                        <Link href="/dashboard">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Dashboard
                        </Link>
                    </Button>

                    <div className="flex items-start justify-between">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <h1 className="text-4xl font-bold tracking-tight">{organization.name}</h1>
                                <Badge variant="secondary" className="text-xs">
                                    {slug}
                                </Badge>
                            </div>
                            {organization.description && (
                                <p className="text-muted-foreground text-lg max-w-2xl">
                                    {organization.description}
                                </p>
                            )}
                        </div>
                        <CreateLinkButton organizationSlug={slug} size="lg" />
                    </div>
                </div>

                <Separator className="mb-8" />

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatsCard
                        title="Total Links"
                        value={links.length}
                        icon={<Link2 className="h-5 w-5 text-muted-foreground" />}
                    />
                    <StatsCard
                        title="Active Links"
                        value={activeLinks}
                        icon={<CheckCircle2 className="h-5 w-5 text-green-600" />}
                    />
                    <StatsCard
                        title="Total Clicks"
                        value={totalClicks.toLocaleString()}
                        icon={<Eye className="h-5 w-5 text-blue-600" />}
                    />
                </div>

                {/* Links List */}
                {links.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <div className="rounded-full bg-muted p-4 mb-4">
                                <Link2 className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <CardTitle className="mb-2">No Links Created</CardTitle>
                            <CardDescription className="text-center mb-6 max-w-sm">
                                Start by creating your first short link to track your statistics and manage your redirects.
                            </CardDescription>
                            <CreateLinkButton organizationSlug={slug} />
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-1">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-2xl font-semibold tracking-tight">Links</h2>
                                <p className="text-muted-foreground">
                                    Manage your short links and track their performance
                                </p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            {links.map((link) => (
                                <LinkCard key={link.id} link={link} />
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}