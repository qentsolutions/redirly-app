'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface NavbarProps {
    user?: {
        email: string
        name?: string | null
    } | null
}

export function Navbar({ user }: NavbarProps) {
    const router = useRouter()

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' })
        router.push('/login')
    }

    return (
        <nav className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/dashboard" className="flex items-center">
                            <h1 className="text-xl font-bold text-primary-600">Link Tracker</h1>
                        </Link>
                        <div className="ml-10 flex items-baseline space-x-4">
                            <Link
                                href="/dashboard"
                                className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                            >
                                Dashboard
                            </Link>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {user && (
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-700">{user.name || user.email}</span>
                                <Button variant="ghost" size="sm" onClick={handleLogout}>
                                    Logout
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}