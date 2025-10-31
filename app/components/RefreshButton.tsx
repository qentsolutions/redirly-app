'use client'

import { RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export function RefreshButton() {
    const [isRefreshing, setIsRefreshing] = useState(false)

    const handleRefresh = () => {
        setIsRefreshing(true)
        // Force a full page reload
        window.location.reload()
    }

    return (
        <Button
            size="sm"
            variant="default"
            onClick={handleRefresh}
            className=" px-4 border border-gray-200 shadow-none cursor-pointer "
            disabled={isRefreshing}
        >
            <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
    )
}
