'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Button } from '@/components/ui/button'

function LoginForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const redirect = searchParams.get('redirect') || '/dashboard'

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    })
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setErrors({})

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            })

            const data = await response.json()

            if (!response.ok) {
                if (data.details?.fieldErrors) {
                    setErrors(data.details.fieldErrors)
                } else {
                    setErrors({ general: data.error || 'Erreur lors de la connexion' })
                }
                return
            }

            // Redirection
            router.push(redirect)
        } catch (error) {
            setErrors({ general: 'Erreur réseau. Veuillez réessayer.' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link href="/">
                        <h1 className="text-3xl font-bold text-primary-600">Link Tracker</h1>
                    </Link>
                    <p className="mt-2 text-gray-600">Connectez-vous à votre compte</p>
                </div>

                <Card>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {errors.general && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                {errors.general}
                            </div>
                        )}

                        <Input
                            label="Email"
                            type="email"
                            placeholder="votre@email.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            error={errors.email?.[0]}
                            required
                        />

                        <Input
                            label="Mot de passe"
                            type="password"
                            placeholder="Votre mot de passe"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            error={errors.password?.[0]}
                            required
                        />

                        <Button type="submit" className="w-full" loading={loading}>
                            Se connecter
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Pas encore de compte ?{' '}
                            <Link href="/signup" className="text-primary-600 hover:text-primary-700 font-medium">
                                S'inscrire
                            </Link>
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50">
                <div className="w-full max-w-md text-center">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-64 mx-auto"></div>
                    </div>
                </div>
            </div>
        }>
            <LoginForm />
        </Suspense>
    )
}