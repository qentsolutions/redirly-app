'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { ClicksChart } from '../ClicksChart'
import { StatsBreakdown } from '../StatsBreakdown'

interface LinkStatsClientProps {
    linkId: string
}

interface Stats {
    totalClicks: number
    recentClicks: number
    clicksByDay: Array<{ date: string; count: number }>
    clicksByCountry: Array<{ country: string | null; count: number }>
    clicksByDevice: Array<{ device: string | null; count: number }>
    clicksByBrowser: Array<{ browser: string | null; count: number }>
    clicksByOS: Array<{ os: string | null; count: number }>
}

type Period = '1' | '7' | '30'

export function LinkStatsClient({ linkId }: LinkStatsClientProps) {
    const [stats, setStats] = useState<Stats | null>(null)
    const [qrCode, setQrCode] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [showQR, setShowQR] = useState(false)
    const [period, setPeriod] = useState<Period>('30')

    useEffect(() => {
        fetchStats()
    }, [linkId, period])

    const fetchStats = async () => {
        setLoading(true)
        try {
            const response = await fetch(`/api/links/${linkId}/stats?period=${period}`)
            const data = await response.json()
            setStats(data.stats)
        } catch (error) {
            console.error('Error fetching stats:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchQRCode = async () => {
        try {
            const response = await fetch(`/api/links/${linkId}/qrcode`)
            const data = await response.json()
            setQrCode(data.qrCode)
            setShowQR(true)
        } catch (error) {
            console.error('Error fetching QR code:', error)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        )
    }

    if (!stats) {
        return (
            <Card>
                <CardContent>
                    <p className="text-center text-gray-500 py-12">Impossible de charger les statistiques</p>
                </CardContent>
            </Card>
        )
    }

    const getPeriodLabel = () => {
        switch (period) {
            case '1':
                return '24 dernières heures'
            case '7':
                return '7 derniers jours'
            case '30':
                return '30 derniers jours'
            default:
                return '30 derniers jours'
        }
    }

    return (
        <div className="space-y-6">
            {/* Graphique des clics par jour */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <CardTitle>Clics au fil du temps ({getPeriodLabel()})</CardTitle>
                            <Button size="sm" variant="ghost" onClick={fetchQRCode}>
                                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                </svg>
                                Générer QR Code
                            </Button>
                        </div>
                        {/* Toggles de période */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPeriod('1')}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                    period === '1'
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                24 heures
                            </button>
                            <button
                                onClick={() => setPeriod('7')}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                    period === '7'
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                7 jours
                            </button>
                            <button
                                onClick={() => setPeriod('30')}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                    period === '30'
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                30 jours
                            </button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <ClicksChart data={stats.clicksByDay} period={period} />
                </CardContent>
            </Card>

            {/* QR Code */}
            {showQR && qrCode && (
                <Card>
                    <CardHeader>
                        <CardTitle>QR Code</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center">
                            <img src={qrCode} alt="QR Code" className="w-64 h-64" />
                            <p className="text-sm text-gray-600 mt-4">Scannez ce code pour accéder au lien</p>
                            <a
                                href={qrCode}
                                download={`qrcode-${linkId}.png`}
                                className="mt-4 text-primary-600 hover:text-primary-700 text-sm font-medium"
                            >
                                Télécharger le QR Code
                            </a>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Statistiques détaillées */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Par pays */}
                <Card>
                    <CardHeader>
                        <CardTitle>Clics par pays</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <StatsBreakdown
                            title="Top 10 pays"
                            data={stats.clicksByCountry.map(c => ({ label: c.country || 'Inconnu', count: c.count }))}
                            total={stats.totalClicks}
                        />
                    </CardContent>
                </Card>

                {/* Par device */}
                <Card>
                    <CardHeader>
                        <CardTitle>Clics par appareil</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <StatsBreakdown
                            title="Types d'appareils"
                            data={stats.clicksByDevice.map(d => ({ label: d.device || 'Inconnu', count: d.count }))}
                            total={stats.totalClicks}
                        />
                    </CardContent>
                </Card>

                {/* Par navigateur */}
                <Card>
                    <CardHeader>
                        <CardTitle>Clics par navigateur</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <StatsBreakdown
                            title="Top 5 navigateurs"
                            data={stats.clicksByBrowser.map(b => ({ label: b.browser || 'Inconnu', count: b.count }))}
                            total={stats.totalClicks}
                        />
                    </CardContent>
                </Card>

                {/* Par OS */}
                <Card>
                    <CardHeader>
                        <CardTitle>Clics par système d'exploitation</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <StatsBreakdown
                            title="Top 5 OS"
                            data={stats.clicksByOS.map(o => ({ label: o.os || 'Inconnu', count: o.count }))}
                            total={stats.totalClicks}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}