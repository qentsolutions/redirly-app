'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Building2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/app/components/ui/Input'


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
        <div className="min-h-screen bg-background py-12 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                    <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
                        <Link href="/dashboard">
                            <ArrowLeft className="h-4 w-4" />
                            Retour au dashboard
                        </Link>
                    </Button>

                    <div className="flex items-center gap-3 mb-3">
                        <div className="rounded-lg bg-primary/10 p-2">
                            <Building2 className="h-6 w-6" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">Créer une nouvelle organisation</h1>
                    </div>
                    <p className="text-muted-foreground text-lg">
                        Une organisation vous permet de regrouper et gérer vos liens trackés
                    </p>
                </div>

                <Separator className="mb-8" />

                <Card>
                    <CardHeader>
                        <CardTitle>Informations de l'organisation</CardTitle>
                        <CardDescription>
                            Renseignez les détails de votre nouvelle organisation
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {errors.general && (
                                <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
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
                                <label className="block text-sm font-medium mb-2">
                                    Description (optionnel)
                                </label>
                                <textarea
                                    className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
                                    placeholder="Décrivez brièvement votre organisation..."
                                    rows={4}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                                {errors.description?.[0] && (
                                    <p className="mt-2 text-sm text-destructive">{errors.description[0]}</p>
                                )}
                            </div>

                            <Separator />

                            <div className="flex items-center justify-end gap-3">
                                <Button type="button" variant="outline" asChild>
                                    <Link href="/dashboard">
                                        Annuler
                                    </Link>
                                </Button>
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