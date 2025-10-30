'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Modal } from './ui/Modal'


/**
 * Confirmation modal to delete a link
 */

interface DeleteLinkModalProps {
    link: {
        id: string
        name: string
    }
}

export function DeleteLinkModal({ link }: DeleteLinkModalProps) {
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleDelete = async () => {
        setLoading(true)
        setError('')

        try {
            const response = await fetch(`/api/links/${link.id}`, {
                method: 'DELETE',
            })

            if (!response.ok) {
                const data = await response.json()
                setError(data.error || 'Error deleting link')
                return
            }

            setIsOpen(false)
            router.refresh()
        } catch (error) {
            setError('Network error. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(true)}>
                <svg className="w-4 h-4 mr-1 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                </svg>
                <span className="text-red-600">Delete</span>
            </Button>

            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Delete Link">
                <div className="space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-start">
                            <svg
                                className="w-5 h-5 text-yellow-600 mt-0.5"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-yellow-800">Warning</h3>
                                <p className="text-sm text-yellow-700 mt-1">
                                    You are about to delete the link <strong>{link.name}</strong>.
                                </p>
                                <p className="text-sm text-yellow-700 mt-2">
                                    This action is <strong>irreversible</strong> and will also delete all
                                    statistics associated with this link.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4">
                        <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} loading={loading}>
                            Delete Permanently
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    )
}