'use client'
import React, { useState } from 'react'
import { scaleBand, scaleLinear, max } from 'd3'
import {
    FaMobileAlt, FaDesktop, FaTabletAlt,  // Devices
    FaGlobeAmericas, // Country (fallback)
    FaWindows, FaApple, FaLinux, FaAndroid, // OS
    FaChrome, FaFirefoxBrowser, FaSafari, FaEdge, FaOpera // Browsers
} from 'react-icons/fa'
import { ClientTooltip, TooltipContent, TooltipTrigger } from './ui/ClientTooltip'

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
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

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
        const labelLower = label.toLowerCase()
        switch (type) {
            case 'Devices':
                if (labelLower.includes('mobile')) return <FaMobileAlt className="mr-1 text-blue-600 text-lg" />
                if (labelLower.includes('desktop')) return <FaDesktop className="mr-1 text-gray-700 text-lg" />
                if (labelLower.includes('tablet')) return <FaTabletAlt className="mr-1 text-purple-600 text-lg" />
                return <FaMobileAlt className="mr-1 text-blue-600 text-lg" />
            case 'OS':
                if (labelLower.includes('windows')) return <FaWindows className="mr-1 text-blue-600 text-lg" />
                if (labelLower.includes('mac') || labelLower.includes('ios')) return <FaApple className="mr-1 text-gray-800 text-lg" />
                if (labelLower.includes('linux')) return <FaLinux className="mr-1 text-yellow-600 text-lg" />
                if (labelLower.includes('android')) return <FaAndroid className="mr-1 text-green-600 text-lg" />
                return null
            case 'Browser':
                if (labelLower.includes('chrome')) return <FaChrome className="mr-1 text-yellow-500 text-lg" />
                if (labelLower.includes('firefox')) return <FaFirefoxBrowser className="mr-1 text-orange-600 text-lg" />
                if (labelLower.includes('safari')) return <FaSafari className="mr-1 text-blue-600 text-lg" />
                if (labelLower.includes('edge')) return <FaEdge className="mr-1 text-blue-700 text-lg" />
                if (labelLower.includes('opera')) return <FaOpera className="mr-1 text-red-600 text-lg" />
                return null
            case 'Country':
                if (labelLower === 'unknown') return <FaGlobeAmericas className="mr-1 text-gray-500 text-lg" />
                return null // On utilise le flag si disponible
            default:
                return null
        }
    }

    return (
        <div className="w-full pb-10">
            <ClientTooltip>
                <div className="relative w-full" style={{ height: containerHeight }}>
                    <div className="absolute inset-0 left-2 right-2 overflow-visible z-20">
                        {displayData.map((entry, i) => {
                            const barWidth = xScale(entry.count)
                            const percentage = total > 0 ? (entry.count / total) * 100 : 0
                            return (
                                <TooltipTrigger
                                    key={i}
                                    content={
                                        <div>
                                            <div className="font-medium">
                                                {entry.count} {entry.count <= 1 ? 'click' : 'clicks'}
                                            </div>
                                            <div className="text-gray-500 text-sm">
                                                {entry.label}
                                            </div>
                                        </div>
                                    }
                                >
                                    <div
                                        style={{
                                            position: "absolute",
                                            top: `${yScale(entry.label)}px`,
                                            height: `${barHeight}px`,
                                            width: '100%',
                                        }}
                                    >
                                        <div
                                            className={`relative flex items-center transition-all duration-200 ${onItemClick && entry.label !== 'Unknown' ? 'cursor-pointer' : ''} ${hoveredIndex !== null && hoveredIndex !== i ? 'opacity-30 grayscale bg-white border border-gray-200' : 'bg-white border border-gray-200'}`}
                                            style={{
                                                height: `${barHeight}px`,
                                                width: `${barWidth}%`,
                                                borderRadius: `0 4px 4px 0`,
                                            }}
                                            onClick={() => onItemClick && entry.label !== 'Unknown' && onItemClick(entry.label, type)}
                                            onMouseEnter={() => setHoveredIndex(i)}
                                            onMouseLeave={() => setHoveredIndex(null)}
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
                                        </div>
                                        <span
                                            style={{
                                                position: 'absolute',
                                                right: '8px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                fontSize: "0.75rem",
                                                fontWeight: "500",
                                                color: '#6b7280',
                                                whiteSpace: 'nowrap',
                                                pointerEvents: 'none'
                                            }}
                                        >
                                            {percentage.toFixed(1)}%
                                        </span>
                                    </div>
                                </TooltipTrigger>
                            )
                        })}
                        <TooltipContent />
                        {/* Grid lines
                        <svg className="h-full w-full" viewBox={`0 0 100 ${containerHeight}`} preserveAspectRatio="none">
                            {xScale.ticks(2).map((value, i) => (
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
                        </svg> */}
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
            </ClientTooltip>
        </div>
    )
}
