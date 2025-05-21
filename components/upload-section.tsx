"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import ImageUploader from "@/components/image-uploader"
import { uploadTemplate } from "@/lib/api"

export default function UploadSection() {
  const router = useRouter()
  const [isUploading, setIsUploading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const handleImageSelected = (selectedFile: File, previewUrl: string) => {
    setFile(selectedFile)
    setPreview(previewUrl)
  }

  const handleUpload = async () => {
    if (!file || !preview) return

    try {
      setIsUploading(true)

      // Store the image data in localStorage so it can be accessed by the editor
      localStorage.setItem("templateImage", preview)

      // Generate a template ID
      const templateId = await uploadTemplate(file)

      // Navigate to the edit tab with the template ID
      // Use window.location.href to ensure a full page refresh that will pick up the tab parameter
      const url = new URL(window.location.href)
      url.searchParams.set("tab", "edit")
      url.searchParams.set("id", templateId)
      window.location.href = url.toString()
    } catch (error) {
      console.error("Upload failed:", error)
      alert("Failed to upload image. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <ImageUploader onImageSelected={handleImageSelected} initialPreview={preview} />
        </CardContent>
      </Card>

      {preview && (
        <div className="flex justify-center md:justify-end">
          <Button onClick={handleUpload} disabled={isUploading} className="w-full md:w-auto">
            {isUploading ? "Uploading..." : "Continue to Editor"}
            {!isUploading && <Upload className="ml-2 h-4 w-4" />}
          </Button>
        </div>
      )}
    </div>
  )
}
