'use client'
import React from 'react'
import { scaleBand, scaleLinear, max } from 'd3'

interface StatItem {
    label: string
    count: number
    flag?: string
}

interface StatsBreakdownProps {
    title: string
    data: StatItem[]
    total: number
}

export function StatsBreakdown({ title, data, total }: StatsBreakdownProps) {
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

    return (
        <div className="w-full pb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">{title}</h4>
            <div className="relative w-full" style={{ height: containerHeight }}>
                <div className="absolute inset-0 left-10 right-4 overflow-visible z-20">
                    {displayData.map((entry, i) => {
                        const barWidth = xScale(entry.count)
                        const percentage = total > 0 ? (entry.count / total) * 100 : 0
                        return (
                            <div
                                key={i}
                                className="relative bg-blue-200 flex items-center"
                                style={{
                                    top: `${yScale(entry.label)}px`,
                                    height: `${barHeight}px`,
                                    width: `${barWidth}%`,
                                    borderRadius: `0 4px 4px 0`,
                                    position: "absolute",
                                }}
                            >
                                {entry.flag && (
                                    <img
                                        src={`https://hatscripts.github.io/circle-flags/flags/${entry.flag}.svg`}
                                        className="w-5 h-5 ml-2 mr-1 opacity-80"
                                    />
                                )}
                                <span
                                    style={{
                                        marginLeft: entry.flag ? '0' : '14px',
                                        fontSize: "0.75rem",
                                        fontWeight: "700",
                                        color: '#4b5563'
                                    }}
                                >
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
