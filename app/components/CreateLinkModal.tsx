'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Modal } from './ui/Modal'
import { Input } from './ui/Input'
import { Button } from './ui/Button'


interface CreateLinkModalProps {
    organizationSlug: string
}

export function CreateLinkModal({ organizationSlug }: CreateLinkModalProps) {
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        originalUrl: '',
    })
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(false)

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
                body: JSON.stringify(formData),
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

            // Réinitialise le formulaire et ferme le modal
            setFormData({ name: '', originalUrl: '' })
            setIsOpen(false)

            // Rafraîchit la page
            router.refresh()
        } catch (error) {
            setErrors({ general: 'Erreur réseau. Veuillez réessayer.' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <Button onClick={() => setIsOpen(true)}>
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Créer un lien
            </Button>

            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Créer un nouveau lien">
                <form onSubmit={handleSubmit} className="space-y-4">
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
                        required
                    />

                    <Input
                        label="URL de destination"
                        type="url"
                        placeholder="https://example.com/ma-page"
                        value={formData.originalUrl}
                        onChange={(e) => setFormData({ ...formData, originalUrl: e.target.value })}
                        error={errors.originalUrl?.[0]}
                        helperText="L'URL vers laquelle le lien court redirigera"
                        required
                    />

                    <div className="flex items-center justify-end gap-3 pt-4">
                        <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
                            Annuler
                        </Button>
                        <Button type="submit" loading={loading}>
                            Créer le lien
                        </Button>
                    </div>
                </form>
            </Modal>
        </>
    )
}