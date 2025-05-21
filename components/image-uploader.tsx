"use client"

import type React from "react"

import { useState, useRef } from "react"
import { ImageIcon, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ImageUploaderProps {
  onImageSelected: (file: File, preview: string) => void
  initialPreview?: string | null
  className?: string
}

export default function ImageUploader({ onImageSelected, initialPreview = null, className = "" }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [preview, setPreview] = useState<string | null>(initialPreview)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      processFile(files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0])
    }
  }

  const processFile = (file: File) => {
    // Validate file is an image
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file")
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      setPreview(result)
      onImageSelected(file, result)
    }
    reader.readAsDataURL(file)
  }

  const clearImage = () => {
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className={`${className}`}>
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/20"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {preview ? (
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-0 right-0 bg-white/80 hover:bg-white/90 rounded-full p-1 m-2"
              onClick={(e) => {
                e.stopPropagation()
                clearImage()
              }}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Remove image</span>
            </Button>
            <img
              src={preview || "/placeholder.svg"}
              alt="Preview"
              className="max-h-[300px] mx-auto object-contain rounded-md"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 mb-4 rounded-full bg-muted flex items-center justify-center">
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">Drag and drop your image</h3>
            <p className="text-sm text-muted-foreground mb-4">or click to browse from your device</p>
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              Choose Image
            </Button>
            <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
          </div>
        )}
      </div>
    </div>
  )
}
