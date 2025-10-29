'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/app/components/ui/Input'
import { Button } from '@/app/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/Card'

/**
 * Page dédiée pour créer un nouveau lien
 * Accessible via /organization/[slug]/create-link
 */

function CreateLinkForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const organizationSlug = searchParams.get('org')

    const [formData, setFormData] = useState({
        name: '',
        originalUrl: '',
        customDomain: '',
    })
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [createdLink, setCreatedLink] = useState<any>(null)

    if (!organizationSlug) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Card className="max-w-md">
                    <CardContent>
                        <p className="text-red-600">Organisation non spécifiée</p>
                        <Link href="/dashboard">
                            <Button className="mt-4">Retour au dashboard</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setErrors({})

        try {
            const response = await fetch(`/api/organizations/${organizationSlug}/links`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    originalUrl: formData.originalUrl,
                    ...(formData.customDomain && { customDomain: formData.customDomain }),
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                if (data.details?.fieldErrors) {
                    setErrors(data.details.fieldErrors)
                } else {
                    setErrors({ general: data.error || 'Erreur lors de la création du lien' })
                }
                return
            }

            setSuccess(true)
            setCreatedLink(data.link)
            setFormData({ name: '', originalUrl: '', customDomain: '' })
        } catch (error) {
            setErrors({ general: 'Erreur réseau. Veuillez réessayer.' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <Link
                        href={`/organization/${organizationSlug}`}
                        className="text-sm text-primary-600 hover:text-primary-700 inline-flex items-center"
                    >
                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Retour à l'organisation
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Créer un nouveau lien</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {success && createdLink ? (
                            <div className="space-y-6">
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <div className="flex items-start">
                                        <svg
                                            className="w-5 h-5 text-green-600 mt-0.5"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-green-800">Lien créé avec succès !</h3>
                                            <p className="text-sm text-green-700 mt-1">
                                                Votre lien court est prêt à être utilisé
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 block mb-2">
                                            Votre lien court
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <code className="flex-1 bg-white border border-gray-300 px-4 py-3 rounded-lg font-mono text-sm">
                                                {process.env.NEXT_PUBLIC_APP_URL}/{createdLink.shortCode}
                                            </code>
                                            <Button
                                                variant="secondary"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(
                                                        `${process.env.NEXT_PUBLIC_APP_URL}/${createdLink.shortCode}`
                                                    )
                                                }}
                                            >
                                                Copier
                                            </Button>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-sm text-gray-600">
                                            <strong>Nom :</strong> {createdLink.name}
                                        </p>
                                        <p className="text-sm text-gray-600 mt-1">
                                            <strong>Destination :</strong> {createdLink.originalUrl}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Button onClick={() => setSuccess(false)}>Créer un autre lien</Button>
                                    <Link href={`/organization/${organizationSlug}`}>
                                        <Button variant="secondary">Retour à l'organisation</Button>
                                    </Link>
                                    <Link href={`/link/${createdLink.id}`}>
                                        <Button variant="ghost">Voir les statistiques</Button>
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {errors.general && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                        {errors.general}
                                    </div>
                                )}

                                <Input
                                    label="Nom du lien"
                                    placeholder="Ex: Page produit 2025"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    error={errors.name?.[0]}
                                    helperText="Un nom descriptif pour identifier facilement ce lien"
                                    required
                                />

                                <Input
                                    label="URL de destination"
                                    type="url"
                                    placeholder="https://example.com/ma-page"
                                    value={formData.originalUrl}
                                    onChange={(e) => setFormData({ ...formData, originalUrl: e.target.value })}
                                    error={errors.originalUrl?.[0]}
                                    helperText="L'URL complète vers laquelle le lien court redirigera"
                                    required
                                />

                                <Input
                                    label="Domaine personnalisé (optionnel)"
                                    type="url"
                                    placeholder="https://votredomaine.com"
                                    value={formData.customDomain}
                                    onChange={(e) => setFormData({ ...formData, customDomain: e.target.value })}
                                    error={errors.customDomain?.[0]}
                                    helperText="Si vous avez configuré un domaine personnalisé"
                                />

                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div className="flex items-start">
                                        <svg
                                            className="w-5 h-5 text-blue-600 mt-0.5"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-blue-800">À propos du tracking</h3>
                                            <p className="text-sm text-blue-700 mt-1">
                                                Tous les clics sur ce lien seront trackés de manière anonymisée (RGPD
                                                compliant). Les IPs sont hashées et aucune donnée personnelle n'est
                                                conservée.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-4">
                                    <Link href={`/organization/${organizationSlug}`}>
                                        <Button type="button" variant="ghost">
                                            Annuler
                                        </Button>
                                    </Link>
                                    <Button type="submit" loading={loading}>
                                        Créer le lien
                                    </Button>
                                </div>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default function CreateLinkPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="animate-pulse">
                        <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
                        <div className="bg-white rounded-lg shadow p-8">
                            <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
                            <div className="space-y-4">
                                <div className="h-12 bg-gray-200 rounded"></div>
                                <div className="h-12 bg-gray-200 rounded"></div>
                                <div className="h-12 bg-gray-200 rounded"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        }>
            <CreateLinkForm />
        </Suspense>
    )
}
