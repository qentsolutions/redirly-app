'use client'
import React from 'react'
import { scaleBand, scaleLinear, max } from 'd3'
import {
    FaMobileAlt, FaDesktop, FaTabletAlt,  // Devices
    FaWindows, FaApple, FaLinux, FaAndroid, // OS
    FaChrome, FaFirefoxBrowser, FaSafari, FaEdge, FaOpera, // Browsers
    FaGlobeAmericas, // Country (fallback)
} from 'react-icons/fa'

interface StatItem {
    label: string
    count: number
    flag?: string
}

interface StatsBreakdownProps {
    title: string
    data: StatItem[]
    total: number
    type: 'Devices' | 'OS' | 'Browser' | 'Country'
    onItemClick?: (label: string, type: string) => void
}

export function StatsBreakdown({ title, data, total, type, onItemClick }: StatsBreakdownProps) {
    if (data.length === 0) {
        return (
            <div className="text-center py-4 text-gray-500">
                No data available
            </div>
        )
    }

    // Calcul de la somme des counts
    const sum = data.reduce((acc, item) => acc + item.count, 0)
    // Ajout de "Others" si la somme est inférieure au total
    let displayData = [...data]
    if (sum < total) {
        displayData = [
            ...data,
            {
                label: "Unknown",
                count: total - sum,
                flag: undefined
            }
        ]
    }

    // Paramètres de hauteur
    const barHeight = 40 // px
    const containerHeight = barHeight * displayData.length * 1.5

    // Scales
    const yScale = scaleBand()
        .domain(displayData.map((d) => d.label))
        .range([0, containerHeight])
        .padding(0.5)

    const xScale = scaleLinear()
        .domain([0, max(displayData.map((d) => d.count)) ?? 0])
        .range([0, 100])

    // Fonction pour choisir l'icône selon le type et le label
    const getIcon = (label: string, type: string) => {
        switch (type) {
            case 'Devices':
                if (label.toLowerCase().includes('mobile')) return <FaMobileAlt className="mr-1" />
                if (label.toLowerCase().includes('desktop')) return <FaDesktop className="mr-1" />
                if (label.toLowerCase().includes('tablet')) return <FaTabletAlt className="mr-1" />
                return <FaMobileAlt className="mr-1" />
            case 'OS':
                if (label.toLowerCase().includes('windows')) return <FaWindows className="mr-1" />
                if (label.toLowerCase().includes('mac') || label.toLowerCase().includes('ios')) return <FaApple className="mr-1" />
                if (label.toLowerCase().includes('linux')) return <FaLinux className="mr-1" />
                if (label.toLowerCase().includes('android')) return <FaAndroid className="mr-1" />
                return <FaWindows className="mr-1" />
            case 'Browser':
                if (label.toLowerCase().includes('chrome')) return <FaChrome className="mr-1" />
                if (label.toLowerCase().includes('firefox')) return <FaFirefoxBrowser className="mr-1" />
                if (label.toLowerCase().includes('safari')) return <FaSafari className="mr-1" />
                if (label.toLowerCase().includes('edge')) return <FaEdge className="mr-1" />
                if (label.toLowerCase().includes('opera')) return <FaOpera className="mr-1" />
                return <FaChrome className="mr-1" />
            case 'Country':
                if (label.toLowerCase() === 'unknown') return <FaGlobeAmericas className="mr-1" />
                return null // On utilise le flag si disponible
            default:
                return null
        }
    }

    return (
        <div className="w-full">
            <h4 className="text-sm font-medium text-gray-900 mb-3">{title}</h4>
            <div className="relative w-full" style={{ height: containerHeight }}>
                <div className="absolute inset-0 left-10 right-4 overflow-visible z-20">
                    {displayData.map((entry, i) => {
                        const barWidth = xScale(entry.count)
                        const percentage = total > 0 ? (entry.count / total) * 100 : 0
                        return (
                            <div
                                key={i}
                                className={`relative bg-blue-200 flex items-center ${onItemClick && entry.label !== 'Unknown' ? 'cursor-pointer hover:bg-blue-300 transition-colors' : ''}`}
                                style={{
                                    top: `${yScale(entry.label)}px`,
                                    height: `${barHeight}px`,
                                    width: `${barWidth}%`,
                                    borderRadius: `0 4px 4px 0`,
                                    position: "absolute",
                                }}
                                onClick={() => onItemClick && entry.label !== 'Unknown' && onItemClick(entry.label, type)}
                            >
                           
                                <span
                                className="flex items-center gap-2"
                                    style={{
                                        marginLeft: type === 'Country' && entry.flag ? '0' : '10px',
                                        fontSize: "0.75rem",
                                        fontWeight: "700",
                                        color: '#4b5563'
                                    }}
                                >
                                    {type === 'Country' && entry.flag && (
                                        <img
                                            src={`https://hatscripts.github.io/circle-flags/flags/${entry.flag}.svg`}
                                            className="w-5 h-5 ml-2 mr-1 opacity-80"
                                        />
                                    )}
                                    {type !== 'Country' && getIcon(entry.label, type)}
                                    {entry.label}
                                </span>
                                <span
                                    style={{
                                        position: "absolute",
                                        right: '8px',
                                        fontSize: "0.75rem",
                                        fontWeight: "500",
                                        color: '#6b7280'
                                    }}
                                >
                                    {percentage.toFixed(1)}%
                                </span>
                            </div>
                        )
                    })}
                    {/* Grid lines */}
                    <svg className="h-full w-full" viewBox={`0 0 100 ${containerHeight}`} preserveAspectRatio="none">
                        {xScale.ticks(8).map((value, i) => (
                            <g
                                key={i}
                                transform={`translate(${xScale(value)},0)`}
                                className="text-gray-400/80"
                            >
                                <line
                                    y1={0}
                                    y2={containerHeight}
                                    stroke="currentColor"
                                    strokeDasharray="6,5"
                                    strokeWidth={0.5}
                                    vectorEffect="non-scaling-stroke"
                                />
                            </g>
                        ))}
                    </svg>
                    {/* X Axis (Values) */}
                    {xScale.ticks(4).map((value, i) => (
                        <div
                            key={i}
                            style={{
                                left: `${xScale(value)}%`,
                                top: `${containerHeight}px`,
                            }}
                            className="absolute text-xs -translate-x-1/2 tabular-nums text-gray-400"
                        >
                            {value}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
