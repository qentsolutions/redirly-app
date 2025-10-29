'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Button } from '@/components/ui/button'

export default function SignupPage() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        name: '',
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
            const response = await fetch('/api/auth/signup', {
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
                    setErrors({ general: data.error || 'Erreur lors de l\'inscription' })
                }
                return
            }

            // Redirection vers le dashboard
            router.push('/dashboard')
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
                    <p className="mt-2 text-gray-600">Créez votre compte</p>
                </div>

                <Card>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {errors.general && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                {errors.general}
                            </div>
                        )}

                        <Input
                            label="Nom"
                            type="text"
                            placeholder="Votre nom"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            error={errors.name?.[0]}
                        />

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
                            placeholder="Minimum 8 caractères"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            error={errors.password?.[0]}
                            required
                        />

                        <Button type="submit" className="w-full" loading={loading}>
                            S'inscrire
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Vous avez déjà un compte ?{' '}
                            <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                                Se connecter
                            </Link>
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    )
}