'use client'
import React from 'react'
import { scaleBand, scaleLinear, max } from 'd3'
import {
    FaMobileAlt, FaDesktop, FaTabletAlt,  // Devices
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
        const labelLower = label.toLowerCase()
        switch (type) {
            case 'Devices':
                if (labelLower.includes('mobile')) return <FaMobileAlt className="mr-1 text-blue-600" />
                if (labelLower.includes('desktop')) return <FaDesktop className="mr-1 text-gray-700" />
                if (labelLower.includes('tablet')) return <FaTabletAlt className="mr-1 text-purple-600" />
                return <FaMobileAlt className="mr-1 text-blue-600" />
            case 'OS':
                if (labelLower.includes('windows')) {
                    return (
                        <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none">
                            <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" fill="#0078D4" />
                        </svg>
                    )
                }
                if (labelLower.includes('mac') || labelLower.includes('ios')) {
                    return (
                        <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none">
                            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" fill="#000000" />
                        </svg>
                    )
                }
                if (labelLower.includes('linux')) {
                    return (
                        <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none">
                            <path d="M12.504 0c-.155 0-.315.008-.48.021-4.226.333-3.105 4.807-3.17 6.298-.076 1.092-.3 1.953-1.05 3.02-.885 1.051-2.127 2.75-2.716 4.521-.278.84-.41 1.684-.287 2.489.845 5.53 5.26 6.65 8.466 6.65s7.621-1.12 8.466-6.65c.123-.805-.009-1.649-.287-2.489-.589-1.771-1.831-3.47-2.716-4.521-.75-1.067-.974-1.928-1.05-3.02-.065-1.491 1.056-5.965-3.17-6.298-.165-.013-.325-.021-.48-.021zm-.21 3.176c.711 0 1.288.577 1.288 1.288s-.577 1.288-1.288 1.288-1.288-.577-1.288-1.288.577-1.288 1.288-1.288zm-5.576 7.612c.711 0 1.288.577 1.288 1.288s-.577 1.288-1.288 1.288-1.288-.577-1.288-1.288.577-1.288 1.288-1.288zm11.152 0c.711 0 1.288.577 1.288 1.288s-.577 1.288-1.288 1.288-1.288-.577-1.288-1.288.577-1.288 1.288-1.288z" fill="#FCC624" />
                        </svg>
                    )
                }
                if (labelLower.includes('android')) {
                    return (
                        <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none">
                            <path d="M17.523 15.341c-.759 0-1.378.617-1.378 1.377 0 .759.619 1.379 1.378 1.379s1.378-.62 1.378-1.379c0-.76-.619-1.377-1.378-1.377zm-11.046 0c-.76 0-1.379.617-1.379 1.377 0 .759.619 1.379 1.379 1.379.759 0 1.378-.62 1.378-1.379 0-.76-.619-1.377-1.378-1.377zm3.8-7.206l1.223-2.279a.278.278 0 0 0-.252-.422.277.277 0 0 0-.255.18l-1.239 2.307c-.907-.408-1.941-.639-3.035-.639-1.094 0-2.128.231-3.035.639L2.445 5.614a.277.277 0 0 0-.255-.18.278.278 0 0 0-.252.422l1.223 2.279C1.197 9.559.035 11.658 0 14.041h24c-.035-2.383-1.197-4.482-3.723-5.906zm5.746 13.172c0 .414.336.75.75.75h1.5c.414 0 .75-.336.75-.75v-6.516h-3v6.516zm-13.496-6.516v6.516c0 .414.336.75.75.75h1.5c.414 0 .75-.336.75-.75v-6.516h-3z" fill="#3DDC84" />
                        </svg>
                    )
                }
                return null
            case 'Browser':
                if (labelLower.includes('chrome')) {
                    return (
                        <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" fill="#fff" />
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="#4285F4" />
                            <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5z" fill="#FBBC04" />
                            <path d="M12 9c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="#34A853" />
                            <circle cx="12" cy="12" r="2" fill="#EA4335" />
                        </svg>
                    )
                }
                if (labelLower.includes('firefox')) {
                    return (
                        <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none">
                            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm7.5 12c0 4.142-3.358 7.5-7.5 7.5S4.5 16.142 4.5 12 7.858 4.5 12 4.5s7.5 3.358 7.5 7.5z" fill="#FF7139" />
                            <circle cx="12" cy="12" r="6" fill="#FFCA28" />
                        </svg>
                    )
                }
                if (labelLower.includes('safari')) {
                    return (
                        <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="#006CFF" strokeWidth="2" fill="none" />
                            <path d="M12 2 L13 11 L22 12 L13 13 L12 22 L11 13 L2 12 L11 11 Z" fill="#006CFF" />
                        </svg>
                    )
                }
                if (labelLower.includes('edge')) {
                    return (
                        <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none">
                            <path d="M21.86 7.85c-.04-.2-.08-.39-.14-.58a10 10 0 0 0-19.44 0c-.06.19-.1.38-.14.58-.07.36-.11.72-.13 1.09v.13c-.01.18-.01.37 0 .55v.12c.02.37.06.73.13 1.09.04.19.08.39.14.58a10 10 0 0 0 19.44 0c.06-.19.1-.38.14-.58.07-.36.11-.72.13-1.09v-.12c.01-.18.01-.37 0-.55v-.13c-.02-.37-.06-.73-.13-1.09z" fill="#0078D7" />
                        </svg>
                    )
                }
                if (labelLower.includes('opera')) {
                    return (
                        <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" fill="#FF1B2D" />
                            <ellipse cx="12" cy="12" rx="5" ry="8" fill="#fff" />
                        </svg>
                    )
                }
                return null
            case 'Country':
                if (labelLower === 'unknown') return <FaGlobeAmericas className="mr-1 text-gray-500" />
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
                                style={{
                                    position: "absolute",
                                    top: `${yScale(entry.label)}px`,
                                    height: `${barHeight}px`,
                                    width: '100%',
                                }}
                            >
                                <div
                                    className={`relative bg-white border border-gray-200 flex items-center ${onItemClick && entry.label !== 'Unknown' ? 'cursor-pointer hover:bg-gray-100 transition-colors' : ''}`}
                                    style={{
                                        height: `${barHeight}px`,
                                        width: `${barWidth}%`,
                                        borderRadius: `0 4px 4px 0`,
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
                        )
                    })}
                    {/* Grid lines */}
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
