'use client'

import React from 'react'

interface StatItem {
    label: string
    count: number
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
                Aucune donnée disponible
            </div>
        )
    }

    return (
        <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">{title}</h4>
            <div className="space-y-3">
                {data.map((item, index) => {
                    const percentage = total > 0 ? (item.count / total) * 100 : 0

                    return (
                        <div key={index}>
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-sm text-gray-700">{item.label || 'Inconnu'}</span>
                                <span className="text-sm font-medium text-gray-900">
                                    {item.count} ({percentage.toFixed(1)}%)
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}