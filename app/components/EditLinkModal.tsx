'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from './ui/Button'
import { Modal } from './ui/Modal'
import { Input } from './ui/Input'


/**
 * Modal pour éditer un lien existant
 */

interface EditLinkModalProps {
    link: {
        id: string
        name: string
        originalUrl: string
        isActive: boolean
    }
}

export function EditLinkModal({ link }: EditLinkModalProps) {
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)
    const [formData, setFormData] = useState({
        name: link.name,
        originalUrl: link.originalUrl,
        isActive: link.isActive,
    })
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setErrors({})

        try {
            const response = await fetch(`/api/links/${link.id}`, {
                method: 'PATCH',
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
                    setErrors({ general: data.error || 'Erreur lors de la modification du lien' })
                }
                return
            }

            setIsOpen(false)
            router.refresh()
        } catch (error) {
            setErrors({ general: 'Erreur réseau. Veuillez réessayer.' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(true)}>
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                </svg>
                Modifier
            </Button>

            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Modifier le lien">
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
                        required
                    />

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="isActive"
                            checked={formData.isActive}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                            Lien actif (accepte les redirections)
                        </label>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4">
                        <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
                            Annuler
                        </Button>
                        <Button type="submit" loading={loading}>
                            Enregistrer
                        </Button>
                    </div>
                </form>
            </Modal>
        </>
    )
}