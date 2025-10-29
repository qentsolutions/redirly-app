'use client'

import { useState } from 'react'
import Link from 'next/link'

import { EditLinkModal } from './EditLinkModal'
import { DeleteLinkModal } from './DeleteLinkModal'
import { buildShortUrl } from '@/lib/links'
import { formatDate, formatNumber } from '../../lib/utils'
import { CopyButton } from './CopyButton'
import { Button } from './ui/Button'
import { Card, CardContent } from './ui/Card'

/**
 * Carte d'affichage d'un lien avec toutes ses actions
 */

interface LinkCardProps {
    link: {
        id: string
        name: string
        originalUrl: string
        shortCode: string
        customDomain: string | null
        isActive: boolean
        createdAt: Date
        _count: {
            clicks: number
        }
    }
}

export function LinkCard({ link }: LinkCardProps) {
    const [showQR, setShowQR] = useState(false)
    const [qrCode, setQrCode] = useState<string | null>(null)
    const [loadingQR, setLoadingQR] = useState(false)

    const shortUrl = buildShortUrl(link.shortCode, link.customDomain)

    const handleGenerateQR = async () => {
        if (qrCode) {
            setShowQR(true)
            return
        }

        setLoadingQR(true)
        try {
            const response = await fetch(`/api/links/${link.id}/qrcode`)
            const data = await response.json()

            if (response.ok && data.qrCode) {
                setQrCode(data.qrCode)
                setShowQR(true)
            }
        } catch (error) {
            console.error('Error generating QR code:', error)
        } finally {
            setLoadingQR(false)
        }
    }

    const handleDownloadQR = () => {
        if (!qrCode) return

        const link: any = document.createElement('a')
        link.href = qrCode
        link.download = `qrcode-${link.shortCode}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    {/* Informations principales */}
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{link.name}</h3>
                            <span
                                className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${link.isActive
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                    }`}
                            >
                                {link.isActive ? 'Actif' : 'Inactif'}
                            </span>
                        </div>

                        {/* Lien court */}
                        <div className="flex items-center gap-2 mb-2">
                            <a
                                href={shortUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                            >
                                {shortUrl}
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                    />
                                </svg>
                            </a>
                            <CopyButton text={shortUrl} size="sm" />
                        </div>

                        {/* URL originale */}
                        <p className="text-sm text-gray-600 mb-3 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                                />
                            </svg>
                            <span className="truncate max-w-md">{link.originalUrl}</span>
                        </p>

                        {/* Statistiques */}
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                    />
                                </svg>
                                <strong>{formatNumber(link._count.clicks)}</strong> clics
                            </span>
                            <span>•</span>
                            <span>Créé le {formatDate(link.createdAt)}</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 ml-4">
                        <Link href={`/link/${link.id}`}>
                            <Button variant="secondary" size="sm" className="w-full">
                                📊 Statistiques
                            </Button>
                        </Link>

                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleGenerateQR}
                            loading={loadingQR}
                            className="w-full"
                        >
                            🔲 QR Code
                        </Button>

                        <EditLinkModal link={link} />
                        <DeleteLinkModal link={link} />
                    </div>
                </div>

                {/* QR Code modal */}
                {showQR && qrCode && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="bg-gray-50 rounded-lg p-4 text-center">
                            <h4 className="text-sm font-medium text-gray-900 mb-3">QR Code</h4>
                            <img src={qrCode} alt="QR Code" className="mx-auto w-48 h-48" />
                            <div className="flex items-center justify-center gap-2 mt-3">
                                <Button size="sm" onClick={handleDownloadQR}>
                                    Télécharger
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => setShowQR(false)}>
                                    Fermer
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}