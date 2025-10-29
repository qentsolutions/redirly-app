'use client'

import { useState } from 'react'
import { copyToClipboard } from '@/lib/utils'
import { Button } from './ui/Button'

/**
 * Composant bouton pour copier du texte dans le presse-papiers
 */

interface CopyButtonProps {
    text: string
    label?: string
    successMessage?: string
    variant?: 'primary' | 'secondary' | 'ghost'
    size?: 'sm' | 'md' | 'lg'
}

export function CopyButton({
    text,
    label = 'Copier',
    successMessage = 'Copié !',
    variant = 'ghost',
    size = 'sm',
}: CopyButtonProps) {
    const [copied, setCopied] = useState(false)

    const handleCopy = async () => {
        const success = await copyToClipboard(text)
        if (success) {
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    return (
        <Button variant={variant} size={size} onClick={handleCopy}>
            {copied ? (
                <>
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                        />
                    </svg>
                    {successMessage}
                </>
            ) : (
                <>
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                    </svg>
                    {label}
                </>
            )}
        </Button>
    )
}