'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/Card'
import { Input } from '@/app/components/ui/Input'
import { Button } from '@/app/components/ui/Button'


export default function NewOrganizationPage() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        name: '',
        description: '',
    })
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setErrors({})

        try {
            const response = await fetch('/api/organizations', {
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
                    setErrors({ general: data.error || 'Erreur lors de la création de l\'organisation' })
                }
                return
            }

            // Redirection vers la nouvelle organisation
            router.push(`/organization/${data.organization.slug}`)
        } catch (error) {
            setErrors({ general: 'Erreur réseau. Veuillez réessayer.' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                    <Link href="/dashboard" className="text-sm text-primary-600 hover:text-primary-700 mb-2 inline-block">
                        ← Retour au dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Créer une nouvelle organisation</h1>
                    <p className="text-gray-600 mt-2">
                        Une organisation vous permet de regrouper et gérer vos liens trackés
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Informations de l'organisation</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {errors.general && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                    {errors.general}
                                </div>
                            )}

                            <Input
                                label="Nom de l'organisation"
                                placeholder="Ex: Mon Entreprise"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                error={errors.name?.[0]}
                                helperText="Le nom sera utilisé pour générer un slug unique"
                                required
                            />

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description (optionnel)
                                </label>
                                <textarea
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    placeholder="Décrivez brièvement votre organisation..."
                                    rows={4}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                                {errors.description?.[0] && (
                                    <p className="mt-1 text-sm text-red-600">{errors.description[0]}</p>
                                )}
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4">
                                <Link href="/dashboard">
                                    <Button type="button" variant="ghost">
                                        Annuler
                                    </Button>
                                </Link>
                                <Button type="submit" loading={loading}>
                                    Créer l'organisation
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}