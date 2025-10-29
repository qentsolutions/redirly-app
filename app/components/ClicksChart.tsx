'use client'

import React from 'react'
import { Line } from 'react-chartjs-2'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js'

// Enregistrement des composants Chart.js
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
)

interface ClicksChartProps {
    data: Array<{ date: string; count: number }>
    period?: '1' | '7' | '30'
}

export function ClicksChart({ data, period = '30' }: ClicksChartProps) {
    const chartData = {
        labels: data.map(d => {
            const date = new Date(d.date)

            // Si période de 24 heures, afficher l'heure
            if (period === '1') {
                return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
            }

            // Sinon, afficher la date
            return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
        }),
        datasets: [
            {
                label: 'Clics',
                data: data.map(d => d.count),
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.4,
            },
        ],
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                mode: 'index' as const,
                intersect: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    precision: 0,
                },
            },
        },
    }

    return (
        <div className="h-64">
            <Line data={chartData} options={options} />
        </div>
    )
}