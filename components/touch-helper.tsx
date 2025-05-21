"use client"

import { useEffect } from "react"

export default function TouchHelper() {
  useEffect(() => {
    // This script helps prevent unwanted touch behaviors on mobile
    const handleTouchStart = (e: TouchEvent) => {
      // Only prevent default for canvas elements
      if (e.target instanceof HTMLCanvasElement) {
        e.preventDefault()
      }
    }

    // Add the event listener with passive: false to allow preventDefault
    document.addEventListener("touchstart", handleTouchStart, { passive: false })

    // Prevent pinch zoom on the canvas
    const preventZoom = (e: TouchEvent) => {
      if (e.target instanceof HTMLCanvasElement && e.touches.length > 1) {
        e.preventDefault()
      }
    }

    document.addEventListener("touchmove", preventZoom, { passive: false })

    return () => {
      document.removeEventListener("touchstart", handleTouchStart)
      document.removeEventListener("touchmove", preventZoom)
    }
  }, [])

  return null
}
