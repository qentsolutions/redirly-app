import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/session'
import { Navbar } from '../components/layout/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '@/components/ui/button'
import { db } from '@/lib/prisma'


export default async function DashboardPage() {
    const user = await getCurrentUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch user organizations
    const organizations = await db.organization.findMany({
        where: {
            members: {
                some: {
                    userId: user.id,
                },
            },
        },
        include: {
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

    // Global statistics
    const totalLinks = organizations.reduce((sum: any, org: any) => sum + org._count.links, 0)

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar user={user} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Welcome, {user.name || 'user'}!
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Manage your organizations and tracked links
                    </p>
                </div>

                {/* Statistiques rapides */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Organizations</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-1">{organizations.length}</p>
                                </div>
                                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Links Created</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-1">{totalLinks}</p>
                                </div>
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                                    <p className="text-sm text-gray-600">Members</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-1">
                                        {organizations.reduce((sum: any, org: any) => sum + org._count.members, 0)}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Liste des organisations */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>My Organizations</CardTitle>
                            <Link href="/organization/new">
                                <Button size="sm">
                                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    New Organization
                                </Button>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {organizations.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-500 mb-4">You don&apos;t have any organizations yet</p>
                                <Link href="/organization/new">
                                    <Button>Create Your First Organization</Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {organizations.map((org: any) => (
                                    <Link
                                        key={org.id}
                                        href={`/organization/${org.slug}`}
                                        className="block p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{org.name}</h3>
                                        {org.description && (
                                            <p className="text-sm text-gray-600 mb-4">{org.description}</p>
                                        )}
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <span>{org._count.links} links</span>
                                            <span>{org._count.members} members</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}