'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '@/components/ui/button'
import { ClicksChart } from '../ClicksChart'
import { StatsBreakdown } from '../StatsBreakdown'
import { DateRangePicker } from '../ui/DateRangePicker'

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

type Period = '1' | '7' | '30' | 'custom'
type Granularity = 'hourly' | 'daily' | 'weekly'

export function LinkStatsClient({ linkId }: LinkStatsClientProps) {
    const [stats, setStats] = useState<Stats | null>(null)
    const [qrCode, setQrCode] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [showQR, setShowQR] = useState(false)
    const [period, setPeriod] = useState<Period>('1')
    const [customDateRange, setCustomDateRange] = useState<{ start: string; end: string } | null>(null)
    const [granularity, setGranularity] = useState<Granularity>('hourly')

    useEffect(() => {
        fetchStats()
    }, [linkId, period, customDateRange, granularity])

    const fetchStats = async () => {
        setLoading(true)
        try {
            let url = `/api/links/${linkId}/stats?period=${period}&granularity=${granularity}`
            if (customDateRange) {
                if (customDateRange.start === customDateRange.end) {
                    url = `/api/links/${linkId}/stats?period=1&startDate=${customDateRange.start}&endDate=${customDateRange.end}&granularity=${granularity}`
                } else if (period === 'custom') {
                    url = `/api/links/${linkId}/stats?period=custom&startDate=${customDateRange.start}&endDate=${customDateRange.end}&granularity=${granularity}`
                }
            }
            const response = await fetch(url)
            const data = await response.json()
            setStats(data.stats)
        } catch (error) {
            console.error('Error fetching stats:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDateRangeChange = (startDate: string, endDate: string) => {
        setCustomDateRange({ start: startDate, end: endDate })
        if (startDate === endDate) {
            setPeriod('1')
            // Pour une seule journée, forcer la granularité horaire
            setGranularity('hourly')
        } else {
            setPeriod('custom')
            // Calculer les jours de différence
            const daysDiff = Math.floor((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
            // Si moins de 2 jours, utiliser horaire
            if (daysDiff < 2 && granularity !== 'hourly') {
                setGranularity('hourly')
            }
            // Si plus de 7 jours et granularité horaire, passer à daily
            if (daysDiff > 7 && granularity === 'hourly') {
                setGranularity('daily')
            }
            // Si moins de 14 jours et granularité weekly, passer à daily
            if (daysDiff < 14 && granularity === 'weekly') {
                setGranularity('daily')
            }
        }
    }

    // Fonction pour savoir quelles granularités sont disponibles
    const getAvailableGranularities = () => {
        if (!customDateRange) {
            // Pour les périodes prédéfinies
            if (period === '1') return ['hourly']
            if (period === '7') return ['hourly', 'daily']
            return ['daily', 'weekly']
        }

        const daysDiff = Math.floor((new Date(customDateRange.end).getTime() - new Date(customDateRange.start).getTime()) / (1000 * 60 * 60 * 24))

        if (daysDiff === 0) return ['hourly']
        if (daysDiff < 2) return ['hourly']
        if (daysDiff <= 7) return ['hourly', 'daily']
        if (daysDiff < 14) return ['daily']
        return ['daily', 'weekly']
    }

    const availableGranularities = getAvailableGranularities()

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

    const getPeriodLabel = () => {
        switch (period) {
            case '1':
                if (customDateRange && customDateRange.start === customDateRange.end) {
                    const selectedDate = new Date(customDateRange.start)
                    const today = new Date()
                    today.setHours(0, 0, 0, 0)
                    selectedDate.setHours(0, 0, 0, 0)
                    if (selectedDate.getTime() === today.getTime()) {
                        return "Aujourd'hui"
                    }
                    return selectedDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
                }
                return "Aujourd'hui"
            case '7':
                return '7 derniers jours'
            case '30':
                return '30 derniers jours'
            case 'custom':
                if (customDateRange) {
                    const start = new Date(customDateRange.start).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
                    const end = new Date(customDateRange.end).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
                    return `${start} - ${end}`
                }
                return 'Période personnalisée'
            default:
                return "Aujourd'hui"
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

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <CardTitle>Clics au fil du temps</CardTitle>
                            <Button size="sm" variant="ghost" onClick={fetchQRCode}>
                                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                </svg>
                                Générer QR Code
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 items-center">
                            <DateRangePicker onDateRangeChange={handleDateRangeChange} periodLabel={getPeriodLabel()} />
                            <select
                                value={granularity}
                                onChange={(e) => setGranularity(e.target.value as Granularity)}
                                className="px-3 py-2 text-sm shadow-sm border border-gray-200  rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="hourly" disabled={!availableGranularities.includes('hourly')}>Par heure</option>
                                <option value="daily" disabled={!availableGranularities.includes('daily')}>Par jour</option>
                                <option value="weekly" disabled={!availableGranularities.includes('weekly')}>Par semaine</option>
                            </select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <ClicksChart data={stats.clicksByDay} period={period} granularity={granularity} />
                </CardContent>
            </Card>
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
