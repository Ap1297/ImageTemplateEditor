"use client"

import { Suspense, useEffect, useState } from "react"
import ImageEditor from "@/components/image-editor"
import MobileHeader from "@/components/mobile-header"
import UploadSection from "@/components/upload-section"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import FontDebug from "@/components/font-debug"

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>("upload")
  const [hasTemplateId, setHasTemplateId] = useState<boolean>(false)
  const [showDebug, setShowDebug] = useState(false)

  // Use useEffect to access window and URL parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const tabParam = searchParams.get("tab")
    const idParam = searchParams.get("id")

    setHasTemplateId(!!idParam)

    // Set the active tab based on URL parameters
    if (tabParam === "edit" || idParam) {
      setActiveTab("edit")
    } else {
      setActiveTab("upload")
    }

    // Enable debug mode with a keyboard shortcut (Ctrl+Shift+D)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "D") {
        setShowDebug((prev) => !prev)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value)

    // Update URL to reflect tab change
    const url = new URL(window.location.href)
    url.searchParams.set("tab", value)
    window.history.pushState({}, "", url.toString())
  }

  return (
    <main className="min-h-screen flex flex-col">
      <MobileHeader />
      <div className="flex-1 container max-w-5xl mx-auto px-4 py-4">
        <h1 className="text-2xl font-bold mb-6 text-center md:text-left">Birthday Template Creator</h1>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="upload">Upload Template</TabsTrigger>
            <TabsTrigger value="edit">Edit Template</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-0">
            <UploadSection />
          </TabsContent>

          <TabsContent value="edit" className="mt-0">
            <Suspense fallback={<EditorSkeleton />}>
              <ImageEditor />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
      {showDebug && <FontDebug />}
    </main>
  )
}

function EditorSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-[300px] w-full rounded-lg" />
      <div className="grid gap-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
      <Skeleton className="h-10 w-[120px]" />
    </div>
  )
}
