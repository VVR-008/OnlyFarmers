"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface Base64ImageProps {
  src: string | undefined
  alt: string
  className?: string
  fallbackSrc?: string
  onError?: () => void
}

export default function Base64Image({
  src,
  alt,
  className,
  fallbackSrc = "/placeholder.svg",
  onError
}: Base64ImageProps) {
  const [hasError, setHasError] = useState(false)
  const [imageSrc, setImageSrc] = useState<string | undefined>(src)

  const handleError = () => {
    if (!hasError) {
      setHasError(true)
      setImageSrc(fallbackSrc)
      onError?.()
    }
  }

  // If src is base64, format it properly
  const getImageSrc = () => {
    if (!imageSrc) return fallbackSrc
    
    // Check if it's already a data URL
    if (imageSrc.startsWith('data:image/')) {
      return imageSrc
    }
    
    // Check if it's base64 without data URL prefix
    if (imageSrc && !imageSrc.startsWith('http') && !imageSrc.startsWith('/')) {
      // Try to detect image type from base64 content
      // For now, assume JPEG (you can enhance this logic)
      return `data:image/jpeg;base64,${imageSrc}`
    }
    
    return imageSrc
  }

  return (
    <img
      src={getImageSrc()}
      alt={alt}
      className={cn("w-full h-full object-cover", className)}
      onError={handleError}
    />
  )
} 