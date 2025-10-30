'use client'

import React, { CSSProperties } from 'react'
import { scaleTime, scaleLinear } from 'd3-scale'
import { line, curveMonotoneX } from 'd3-shape'
import { ClientTooltip, TooltipContent, TooltipTrigger } from './ui/ClientTooltip'

interface ClicksChartProps {
    data: Array<{ date: string; count: number }>
    period?: '1' | '7' | '30' | 'custom'
    granularity?: 'hourly' | 'daily' | 'weekly'
}

export function ClicksChart({ data: rawData, period = '30', granularity = 'daily' }: ClicksChartProps) {
    // Convert dates to Date objects
    const data = rawData.map((d) => ({ ...d, date: new Date(d.date), value: d.count }))

    if (!data || data.length === 0) {
        return (
            <div className="h-72 w-full flex items-center justify-center text-gray-500">
                No data available
            </div>
        )
    }

    // Create scales
    const xScale = scaleTime()
        .domain([data[0].date, data[data.length - 1].date])
        .range([0, 100])

    const maxValue = Math.max(...data.map((d) => d.value), 0)
    const yScale = scaleLinear()
        .domain([0, maxValue])
        .range([100, 0])

    // Create line with curve
    const d3Line = line<(typeof data)[number]>()
        .x((d) => xScale(d.date))
        .y((d) => yScale(d.value))
        .curve(curveMonotoneX)

    const d = d3Line(data)

    if (!d) {
        return null
    }

    // Function to format dates
    const formatDate = (date: Date) => {
        if (granularity === 'hourly') {
            return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
        } else if (granularity === 'weekly') {
            // For weekly view, display the week (ex: "Week 42")
            const weekNumber = getWeekNumber(date)
            return `Week ${weekNumber}`
        }
        return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' })
    }

    // Function to get week number
    const getWeekNumber = (date: Date): number => {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
        const dayNum = d.getUTCDay() || 7
        d.setUTCDate(d.getUTCDate() + 4 - dayNum)
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
        return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
    }

    // Function to check if a point has variations (different from previous or next point)
    const hasVariationAtIndex = (index: number): boolean => {
        if (data.length <= 1) return false

        const currentValue = data[index].value
        const prevValue = index > 0 ? data[index - 1].value : null
        const nextValue = index < data.length - 1 ? data[index + 1].value : null

        // Show point if it's different from previous or next value
        return (prevValue !== null && currentValue !== prevValue) ||
               (nextValue !== null && currentValue !== nextValue)
    }

    return (
        <div
            className="relative h-72 w-full"
            style={
                {
                    '--marginTop': '0px',
                    '--marginRight': '8px',
                    '--marginBottom': '25px',
                    '--marginLeft': '25px',
                } as CSSProperties
            }
        >
            {/* Y axis */}
            <div
                className="absolute inset-0
                    h-[calc(100%-var(--marginTop)-var(--marginBottom))]
                    w-[var(--marginLeft)]
                    translate-y-[var(--marginTop)]
                    overflow-visible
                "
            >
                {yScale
                    .ticks(8)
                    .filter((value) => Number.isInteger(value))
                    .map((value) => (
                        <div
                            key={value}
                            style={{
                                top: `${yScale(value)}%`,
                                left: '0%',
                            }}
                            className="absolute text-xs tabular-nums -translate-y-1/2 text-gray-500 w-full text-right pr-2"
                        >
                            {value}
                        </div>
                    ))}
            </div>

            {/* Chart area */}
            <div
                className="absolute inset-0
                    h-[calc(100%-var(--marginTop)-var(--marginBottom))]
                    w-[calc(100%-var(--marginLeft)-var(--marginRight))]
                    translate-x-[var(--marginLeft)]
                    translate-y-[var(--marginTop)]
                    overflow-visible
                "
            >
                <svg
                    viewBox="0 0 100 100"
                    className="overflow-visible w-full h-full"
                    preserveAspectRatio="none"
                >
                    {/* Grid lines */}
                    {yScale
                        .ticks(8)
                        .filter((value) => Number.isInteger(value))
                        .map((value, i) => (
                            <g
                                key={i}
                                transform={`translate(0,${yScale(value)})`}
                                className="text-zinc-300"
                            >
                                <line
                                    x1={0}
                                    x2={100}
                                    stroke="currentColor"
                                    strokeDasharray="6,5"
                                    strokeWidth={0.5}
                                    vectorEffect="non-scaling-stroke"
                                />
                            </g>
                        ))}
                    {/* Line */}
                    <path
                        d={d}
                        fill="none"
                        className="stroke-blue-500"
                        strokeWidth="3"
                        vectorEffect="non-scaling-stroke"
                    />

                    {/* Circles and Tooltips */}
                    {data.map((point, index) => (
                        <ClientTooltip key={index}>
                            <TooltipTrigger>
                                {hasVariationAtIndex(index) && (
                                    <path
                                        key={`dot-${index}`}
                                        d={`M ${xScale(point.date)} ${yScale(point.value)} l 0.0001 0`}
                                        vectorEffect="non-scaling-stroke"
                                        strokeWidth="7"
                                        strokeLinecap="round"
                                        fill="none"
                                        stroke="currentColor"
                                        className="text-blue-400"
                                    />
                                )}
                                <g className="group/tooltip">
                                    {/* Tooltip Line */}
                                    <line
                                        x1={xScale(point.date)}
                                        y1={0}
                                        x2={xScale(point.date)}
                                        y2={100}
                                        stroke="currentColor"
                                        strokeWidth={1}
                                        className="opacity-0 group-hover/tooltip:opacity-100 text-zinc-300  transition-opacity"
                                        vectorEffect="non-scaling-stroke"
                                        style={{ pointerEvents: 'none' }}
                                    />
                                    {/* Invisible area closest to a specific point for the tooltip trigger */}
                                    <rect
                                        x={(() => {
                                            const prevX = index > 0 ? xScale(data[index - 1].date) : xScale(point.date)
                                            return (prevX + xScale(point.date)) / 2
                                        })()}
                                        y={0}
                                        width={(() => {
                                            const prevX = index > 0 ? xScale(data[index - 1].date) : xScale(point.date)
                                            const nextX =
                                                index < data.length - 1 ? xScale(data[index + 1].date) : xScale(point.date)
                                            const leftBound = (prevX + xScale(point.date)) / 2
                                            const rightBound = (xScale(point.date) + nextX) / 2
                                            return rightBound - leftBound
                                        })()}
                                        height={100}
                                        fill="transparent"
                                    />
                                </g>
                            </TooltipTrigger>
                            <TooltipContent>
                                <div className="font-medium">
                                    {granularity === 'hourly'
                                        ? point.date.toLocaleString('en-US', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
                                        : granularity === 'weekly'
                                        ? `Week ${getWeekNumber(point.date)} - ${point.date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}`
                                        : formatDate(point.date)
                                    }
                                </div>
                                <div className="text-gray-500 text-sm">{point.value} clicks</div>
                            </TooltipContent>
                        </ClientTooltip>
                    ))}
                </svg>

                {/* X Axis */}
                <div className="translate-y-2">
                    {data.map((day, i) => {
                        let shouldShow = false

                        if (granularity === 'hourly') {
                            // For hourly view, display every 3 hours (0h, 3h, 6h, 9h, 12h, 15h, 18h, 21h)
                            const hour = day.date.getHours()
                            shouldShow = hour % 3 === 0
                        } else {
                            // For other views, keep current behavior
                            const isFirst = i === 0
                            const isLast = i === data.length - 1
                            const isMax = day.value === Math.max(...data.map((d) => d.value))
                            shouldShow = isFirst || isLast || isMax
                        }

                        if (!shouldShow) return null

                        return (
                            <div key={i} className="overflow-visible text-zinc-500">
                                <div
                                    style={{
                                        left: `${xScale(day.date)}%`,
                                        top: '100%',
                                        transform: `translateX(${i === 0 ? '0%' : i === data.length - 1 ? '-100%' : '-50%'})`,
                                    }}
                                    className="text-xs absolute"
                                >
                                    {formatDate(day.date)}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}