'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from './ui/Input'
import { Modal } from './ui/Modal'


/**
 * Prominent button and modal to create a new link
 * Enhanced version with more options
 */

interface CreateLinkButtonProps {
    organizationSlug: string
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
    size?: 'default' | 'sm' | 'lg' | 'icon'
    fullWidth?: boolean
}

export function CreateLinkButton({
    organizationSlug,
    variant = 'default',
    size = 'default',
    fullWidth = false,
}: CreateLinkButtonProps) {
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        originalUrl: '',
        customDomain: '',
    })
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [createdLink, setCreatedLink] = useState<any>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setErrors({})

        try {
            const payload: any = {
                name: formData.name,
                originalUrl: formData.originalUrl,
            }

            if (formData.customDomain) {
                payload.customDomain = formData.customDomain
            }

            const response = await fetch(`/api/organizations/${organizationSlug}/links`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            })

            const data = await response.json()

            if (!response.ok) {
                if (data.details?.fieldErrors) {
                    setErrors(data.details.fieldErrors)
                } else {
                    setErrors({ general: data.error || 'Error creating link' })
                }
                return
            }

            // Success
            setCreatedLink(data.link)
            setSuccess(true)
            setFormData({ name: '', originalUrl: '', customDomain: '' })

            // Refresh after 2 seconds
            setTimeout(() => {
                router.refresh()
                setIsOpen(false)
                setSuccess(false)
                setCreatedLink(null)
            }, 2000)
        } catch (error) {
            setErrors({ general: 'Network error. Please try again.' })
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        if (!loading) {
            setIsOpen(false)
            setSuccess(false)
            setCreatedLink(null)
            setFormData({ name: '', originalUrl: '', customDomain: '' })
            setErrors({})
        }
    }

    return (
        <>
            <Button
                onClick={() => setIsOpen(true)}
                variant={variant}
                size={size}
                className={fullWidth ? 'w-full' : ''}
            >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                    />
                </svg>
                Create Link
            </Button>

            <Modal isOpen={isOpen} onClose={handleClose} title="Create New Link">
                {success && createdLink ? (
                    <div className="space-y-4">
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
                                    <h3 className="text-sm font-medium text-green-800">Link created successfully!</h3>
                                    <p className="text-sm text-green-700 mt-1">
                                        Your short link is ready to use
                                    </p>
                                    <div className="mt-3 p-3 bg-white rounded border border-green-200">
                                        <code className="text-sm font-mono text-green-900">
                                            {process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/
                                            {createdLink.shortCode}
                                        </code>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 text-center">
                            Closing automatically in a few moments...
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {errors.general && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                {errors.general}
                            </div>
                        )}

                        <Input
                            label="Link Name"
                            placeholder="Ex: Product Page 2025"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            error={errors.name?.[0]}
                            helperText="A descriptive name to easily identify this link"
                            required
                            autoFocus
                        />

                        <Input
                            label="Destination URL"
                            type="url"
                            placeholder="https://example.com/my-page"
                            value={formData.originalUrl}
                            onChange={(e) => setFormData({ ...formData, originalUrl: e.target.value })}
                            error={errors.originalUrl?.[0]}
                            helperText="The full URL to which the short link will redirect"
                            required
                        />

                        <details className="group">
                            <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                                <span className="inline-flex items-center">
                                    <svg
                                        className="w-4 h-4 mr-1 group-open:rotate-90 transition-transform"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                    Advanced options (optional)
                                </span>
                            </summary>
                            <div className="mt-4 pl-5">
                                <Input
                                    label="Custom Domain"
                                    type="url"
                                    placeholder="https://yourdomain.com"
                                    value={formData.customDomain}
                                    onChange={(e) => setFormData({ ...formData, customDomain: e.target.value })}
                                    error={errors.customDomain?.[0]}
                                    helperText="If you have configured a custom domain"
                                />
                            </div>
                        </details>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                            <div className="flex items-start gap-2">
                                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                <span>
                                    A unique short code will be generated automatically. Clicks will be tracked
                                    anonymously (GDPR compliant).
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-4">
                            <Button type="button" variant="ghost" onClick={handleClose} disabled={loading}>
                                Cancel
                            </Button>
                            <Button type="submit" loading={loading}>
                                {loading ? 'Creating...' : 'Create Link'}
                            </Button>
                        </div>
                    </form>
                )}
            </Modal>
        </>
    )
}