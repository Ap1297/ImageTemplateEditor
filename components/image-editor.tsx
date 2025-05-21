"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Download, Save, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ColorPicker } from "@/components/color-picker"
import { FontSelector } from "@/components/font-selector"
import { DatePicker } from "@/components/ui/date-picker"
import { getTemplate, saveTemplate } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

// Define a type for person entries (name and birthdate)
interface PersonEntry {
  id: string
  name: string
  birthdate?: Date
}

interface TextElement {
  id: string
  type: "personList" | "quote"
  text: string
  x: number
  y: number
  fontSize: number
  color: string
  fontFamily: string
  dragging: boolean
  lineSpacing?: number // Added for multi-line spacing
}

export default function ImageEditor() {
  const searchParams = useSearchParams()
  const templateId = searchParams.get("id")
  const { toast } = useToast()

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [elements, setElements] = useState<TextElement[]>([])
  const [selectedElement, setSelectedElement] = useState<string | null>(null)

  // Replace single name/birthdate with an array of person entries
  const [personEntries, setPersonEntries] = useState<PersonEntry[]>([
    { id: "person-1", name: "", birthdate: undefined },
  ])

  const [quote, setQuote] = useState("")
  const [fontSize, setFontSize] = useState(24)
  const [textColor, setTextColor] = useState("#000000")
  const [fontFamily, setFontFamily] = useState("Arial")
  const [lineSpacing, setLineSpacing] = useState(10) // Added for multi-line spacing
  const [isSaving, setIsSaving] = useState(false)
  const [editorTab, setEditorTab] = useState("content")

  useEffect(() => {
    if (templateId) {
      loadTemplate(templateId)
    } else {
      // Show a message when no template is selected
      setImageUrl(null)
    }
  }, [templateId])

  const loadTemplate = async (id: string) => {
    try {
      // First try to get the image from localStorage
      const storedImage = localStorage.getItem("templateImage")

      if (storedImage) {
        setImageUrl(storedImage)

        // Initialize default text elements
        setElements([
          {
            id: "personList",
            type: "personList",
            text: "Person List",
            x: 100,
            y: 100,
            fontSize: 24,
            color: "#000000",
            fontFamily: "Arial",
            dragging: false,
            lineSpacing: 10,
          },
          {
            id: "quote",
            type: "quote",
            text: "Your quote here",
            x: 100,
            y: 200,
            fontSize: 18,
            color: "#000000",
            fontFamily: "Arial",
            dragging: false,
          },
        ])
      } else {
        // Fallback to API if localStorage doesn't have the image
        const template = await getTemplate(id)
        setImageUrl(template.imageUrl)

        // Initialize default text elements
        setElements([
          {
            id: "personList",
            type: "personList",
            text: "Person List",
            x: 100,
            y: 100,
            fontSize: 24,
            color: "#000000",
            fontFamily: "Arial",
            dragging: false,
            lineSpacing: 10,
          },
          {
            id: "quote",
            type: "quote",
            text: "Your quote here",
            x: 100,
            y: 200,
            fontSize: 18,
            color: "#000000",
            fontFamily: "Arial",
            dragging: false,
          },
        ])
      }
    } catch (error) {
      console.error("Failed to load template:", error)
      toast({
        title: "Error",
        description: "Failed to load template. Please try again.",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    if (!imageUrl) return

    const image = new Image()
    image.crossOrigin = "anonymous" // Add this to avoid CORS issues
    image.src = imageUrl

    image.onload = () => {
      drawCanvas(image)
    }

    image.onerror = (e) => {
      console.error("Error loading image:", e)
      toast({
        title: "Error",
        description: "Failed to load image. Please try uploading again.",
        variant: "destructive",
      })
    }
  }, [imageUrl, elements, personEntries, quote])

  const drawCanvas = (image: HTMLImageElement) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions based on image
    const maxWidth = Math.min(800, window.innerWidth - 40)
    const scale = maxWidth / image.width
    canvas.width = image.width * scale
    canvas.height = image.height * scale

    // Draw image
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height)

    // Draw text elements
    elements.forEach((element) => {
      // Set the font with the element's fontFamily
      ctx.font = `${element.fontSize}px ${element.fontFamily}`

      // Ensure text color is visible - use the element's color or default to black
      const textColor = element.color || "#000000"
      ctx.fillStyle = textColor

      if (element.type === "personList") {
        // Draw the list of persons
        const personListElement = element
        let yOffset = 0

        personEntries.forEach((person, index) => {
          // Format each person entry
          let displayText = ""

          if (person.name) {
            displayText += person.name
          } else {
            displayText += "Name"
          }

          if (person.birthdate) {
            displayText += " - " + format(person.birthdate, "MMMM d, yyyy")
          } else if (person.name) {
            // Only add placeholder if there's a name
            displayText += " - Birthdate"
          }

          // Skip empty entries
          if (displayText.trim() !== "Name - Birthdate" && displayText.trim() !== "") {
            ctx.fillText(displayText, personListElement.x, personListElement.y + yOffset)
            // Add spacing for next line
            yOffset += personListElement.fontSize + (personListElement.lineSpacing || 10)
          }
        })

        // Highlight selected element
        if (selectedElement === element.id) {
          // Calculate the height of the entire list
          const listHeight = personEntries.length * (element.fontSize + (element.lineSpacing || 10))
          // Get the width of the longest entry
          let maxWidth = 0
          personEntries.forEach((person) => {
            let text = ""
            if (person.name) text += person.name
            if (person.birthdate) text += " - " + format(person.birthdate, "MMMM d, yyyy")
            const metrics = ctx.measureText(text)
            maxWidth = Math.max(maxWidth, metrics.width)
          })

          ctx.strokeStyle = "#3b82f6"
          ctx.lineWidth = 2
          ctx.strokeRect(element.x - 5, element.y - element.fontSize, maxWidth + 10, listHeight)
        }
      } else if (element.type === "quote") {
        // Update text content for quote
        let displayText = element.text
        if (quote) {
          displayText = quote
        }

        ctx.fillText(displayText, element.x, element.y)

        // Highlight selected element
        if (selectedElement === element.id) {
          const metrics = ctx.measureText(displayText)
          const height = element.fontSize

          ctx.strokeStyle = "#3b82f6"
          ctx.lineWidth = 2
          ctx.strokeRect(element.x - 5, element.y - height, metrics.width + 10, height + 10)
        }
      }
    })
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Check if clicking on a text element
    for (let i = elements.length - 1; i >= 0; i--) {
      const element = elements[i]
      const ctx = canvas.getContext("2d")
      if (!ctx) continue

      ctx.font = `${element.fontSize}px ${element.fontFamily}`

      if (element.type === "personList") {
        // Calculate the height of the entire list
        const listHeight = personEntries.length * (element.fontSize + (element.lineSpacing || 10))

        // Get the width of the longest entry
        let maxWidth = 0
        personEntries.forEach((person) => {
          let text = ""
          if (person.name) text += person.name
          if (person.birthdate) text += " - " + format(person.birthdate, "MMMM d, yyyy")
          const metrics = ctx.measureText(text)
          maxWidth = Math.max(maxWidth, metrics.width)
        })

        // Check if click is within the list area
        if (
          x >= element.x - 5 &&
          x <= element.x + maxWidth + 5 &&
          y >= element.y - element.fontSize &&
          y <= element.y + listHeight - element.fontSize
        ) {
          // Found element under cursor
          setSelectedElement(element.id)

          // Mark as dragging
          const updatedElements = elements.map((el) => ({
            ...el,
            dragging: el.id === element.id,
          }))
          setElements(updatedElements)

          // Update editor controls with the selected element's properties
          setFontSize(element.fontSize)
          setTextColor(element.color)
          setFontFamily(element.fontFamily)
          setLineSpacing(element.lineSpacing || 10)

          // Switch to style tab when an element is selected
          setEditorTab("style")
          return
        }
      } else if (element.type === "quote") {
        // Determine text content
        let displayText = element.text
        if (quote) {
          displayText = quote
        }

        const metrics = ctx.measureText(displayText)
        const height = element.fontSize

        if (
          x >= element.x - 5 &&
          x <= element.x + metrics.width + 5 &&
          y >= element.y - height &&
          y <= element.y + 10
        ) {
          // Found element under cursor
          setSelectedElement(element.id)

          // Mark as dragging
          const updatedElements = elements.map((el) => ({
            ...el,
            dragging: el.id === element.id,
          }))
          setElements(updatedElements)

          // Update editor controls with the selected element's properties
          setFontSize(element.fontSize)
          setTextColor(element.color)
          setFontFamily(element.fontFamily)

          // Switch to style tab when an element is selected
          setEditorTab("style")
          return
        }
      }
    }

    // If clicked outside any element, deselect
    setSelectedElement(null)
    // Switch back to content tab when no element is selected
    setEditorTab("content")
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const draggingElement = elements.find((el) => el.dragging)
    if (!draggingElement) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const updatedElements = elements.map((el) => {
      if (el.id === draggingElement.id) {
        return {
          ...el,
          x,
          y,
        }
      }
      return el
    })

    setElements(updatedElements)
  }

  const handleMouseUp = () => {
    const updatedElements = elements.map((el) => ({
      ...el,
      dragging: false,
    }))
    setElements(updatedElements)
  }

  // Simple touch event handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    // Prevent default to stop scrolling and other browser behaviors
    e.preventDefault()

    if (e.touches.length !== 1) return

    const touch = e.touches[0]
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = touch.clientX - rect.left
    const y = touch.clientY - rect.top

    // Check if touching a text element
    for (let i = elements.length - 1; i >= 0; i--) {
      const element = elements[i]
      const ctx = canvas.getContext("2d")
      if (!ctx) continue

      ctx.font = `${element.fontSize}px ${element.fontFamily}`

      if (element.type === "personList") {
        // Calculate the height of the entire list
        const listHeight = personEntries.length * (element.fontSize + (element.lineSpacing || 10))

        // Get the width of the longest entry
        let maxWidth = 0
        personEntries.forEach((person) => {
          let text = ""
          if (person.name) text += person.name
          if (person.birthdate) text += " - " + format(person.birthdate, "MMMM d, yyyy")
          const metrics = ctx.measureText(text)
          maxWidth = Math.max(maxWidth, metrics.width)
        })

        // Increase touch area for better mobile experience (without changing CSS)
        const touchPadding = 20 // Larger touch area

        // Check if touch is within the list area with increased padding
        if (
          x >= element.x - touchPadding &&
          x <= element.x + maxWidth + touchPadding &&
          y >= element.y - element.fontSize - touchPadding &&
          y <= element.y + listHeight - element.fontSize + touchPadding
        ) {
          // Found element under touch
          setSelectedElement(element.id)

          // Mark as dragging
          const updatedElements = elements.map((el) => ({
            ...el,
            dragging: el.id === element.id,
          }))
          setElements(updatedElements)

          // Update editor controls with the selected element's properties
          setFontSize(element.fontSize)
          setTextColor(element.color)
          setFontFamily(element.fontFamily)
          setLineSpacing(element.lineSpacing || 10)

          // Switch to style tab when an element is selected
          setEditorTab("style")
          return
        }
      } else if (element.type === "quote") {
        // Determine text content
        let displayText = element.text
        if (quote) {
          displayText = quote
        }

        const metrics = ctx.measureText(displayText)
        const height = element.fontSize

        // Increase touch area for better mobile experience
        const touchPadding = 20 // Larger touch area

        if (
          x >= element.x - touchPadding &&
          x <= element.x + metrics.width + touchPadding &&
          y >= element.y - height - touchPadding &&
          y <= element.y + touchPadding + touchPadding
        ) {
          // Found element under touch
          setSelectedElement(element.id)

          // Mark as dragging
          const updatedElements = elements.map((el) => ({
            ...el,
            dragging: el.id === element.id,
          }))
          setElements(updatedElements)

          // Update editor controls with the selected element's properties
          setFontSize(element.fontSize)
          setTextColor(element.color)
          setFontFamily(element.fontFamily)

          // Switch to style tab when an element is selected
          setEditorTab("style")
          return
        }
      }
    }

    // If touched outside any element, deselect
    setSelectedElement(null)
    // Switch back to content tab when no element is selected
    setEditorTab("content")
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    // Prevent default to stop scrolling
    e.preventDefault()

    if (e.touches.length !== 1) return

    const touch = e.touches[0]
    const canvas = canvasRef.current
    if (!canvas) return

    const draggingElement = elements.find((el) => el.dragging)
    if (!draggingElement) return

    const rect = canvas.getBoundingClientRect()
    const x = touch.clientX - rect.left
    const y = touch.clientY - rect.top

    // Update element position immediately for more responsive feel
    const updatedElements = elements.map((el) => {
      if (el.id === draggingElement.id) {
        return {
          ...el,
          x,
          y,
        }
      }
      return el
    })

    setElements(updatedElements)
  }

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    // Prevent default behavior
    if (e) e.preventDefault()

    const updatedElements = elements.map((el) => ({
      ...el,
      dragging: false,
    }))
    setElements(updatedElements)
  }

  const updateSelectedElement = (updates: Partial<TextElement>) => {
    if (!selectedElement) return

    const updatedElements = elements.map((el) => {
      if (el.id === selectedElement) {
        return {
          ...el,
          ...updates,
        }
      }
      return el
    })

    setElements(updatedElements)
  }

  const handleFontFamilyChange = (newFontFamily: string) => {
    setFontFamily(newFontFamily)
    updateSelectedElement({ fontFamily: newFontFamily })
  }

  const handleLineSpacingChange = (newSpacing: number) => {
    setLineSpacing(newSpacing)
    updateSelectedElement({ lineSpacing: newSpacing })
  }

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Create a temporary link
    const link = document.createElement("a")
    link.download = "birthday-template.png"
    link.href = canvas.toDataURL("image/png")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Success",
      description: "Image downloaded successfully!",
    })
  }

  const handleSave = async () => {
    const canvas = canvasRef.current
    if (!canvas || !templateId) return

    try {
      setIsSaving(true)

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob)
        }, "image/png")
      })

      // Save template data
      await saveTemplate(
        templateId,
        {
          elements,
          personEntries,
          quote,
        },
        blob,
      )

      toast({
        title: "Success",
        description: "Template saved successfully!",
      })
    } catch (error) {
      console.error("Failed to save template:", error)
      toast({
        title: "Error",
        description: "Failed to save template. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Function to add a new person entry
  const addPersonEntry = () => {
    const newId = `person-${personEntries.length + 1}`
    setPersonEntries([...personEntries, { id: newId, name: "", birthdate: undefined }])
  }

  // Function to remove a person entry
  const removePersonEntry = (id: string) => {
    if (personEntries.length <= 1) {
      toast({
        title: "Cannot Remove",
        description: "You must have at least one person entry.",
        variant: "destructive",
      })
      return
    }

    setPersonEntries(personEntries.filter((entry) => entry.id !== id))
  }

  // Function to update a person entry
  const updatePersonEntry = (id: string, updates: Partial<PersonEntry>) => {
    setPersonEntries(personEntries.map((entry) => (entry.id === id ? { ...entry, ...updates } : entry)))
  }

  if (!imageUrl) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4 max-w-md mx-auto">
          <p className="text-amber-800 mb-2">No template image found.</p>
          <p className="text-sm text-amber-700">Please upload an image first using the Upload Template tab.</p>
        </div>
        <Button
          onClick={() => {
            const url = new URL(window.location.href)
            url.searchParams.delete("id")
            url.searchParams.set("tab", "upload")
            window.location.href = url.toString()
          }}
          variant="outline"
        >
          Go to Upload
        </Button>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-[1fr,300px]">
      <div className="space-y-4">
        <div className="bg-gray-100 rounded-lg p-4 flex justify-center">
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="max-w-full border shadow-sm bg-white"
          />
        </div>

        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
          <Button onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button onClick={handleSave} disabled={isSaving} variant="outline">
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save Template"}
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <Tabs value={editorTab} onValueChange={setEditorTab}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="style" disabled={!selectedElement}>
                Style
              </TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">People</h3>
                  <Button onClick={addPersonEntry} size="sm" variant="outline" className="h-8 px-2">
                    <Plus className="h-4 w-4 mr-1" /> Add Person
                  </Button>
                </div>

                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                  {personEntries.map((person, index) => (
                    <div key={person.id} className="p-3 border rounded-md relative">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 absolute top-2 right-2 text-gray-500 hover:text-red-500"
                        onClick={() => removePersonEntry(person.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove</span>
                      </Button>

                      <div className="space-y-2 mt-1">
                        <div>
                          <Label htmlFor={`name-${person.id}`} className="text-xs">
                            Name
                          </Label>
                          <Input
                            id={`name-${person.id}`}
                            value={person.name}
                            onChange={(e) => updatePersonEntry(person.id, { name: e.target.value })}
                            placeholder="Enter name"
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label htmlFor={`birthdate-${person.id}`} className="text-xs">
                            Birthdate
                          </Label>
                          <div className="mt-1">
                            <DatePicker
                              date={person.birthdate}
                              onSelect={(date) => updatePersonEntry(person.id, { birthdate: date })}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t">
                <Label htmlFor="quote">Quote</Label>
                <Textarea
                  id="quote"
                  value={quote}
                  onChange={(e) => setQuote(e.target.value)}
                  placeholder="Enter a quote"
                  rows={3}
                />
              </div>

              <p className="text-sm text-muted-foreground">Tap or drag text elements on the canvas to position them</p>
            </TabsContent>

            <TabsContent value="style" className="space-y-4">
              <div className="space-y-2">
                <Label>Font Family</Label>
                <FontSelector value={fontFamily} onChange={handleFontFamilyChange} />
              </div>

              <div className="space-y-2">
                <Label>Font Size</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[fontSize]}
                    min={12}
                    max={72}
                    step={1}
                    onValueChange={(value) => {
                      const newSize = value[0]
                      setFontSize(newSize)
                      updateSelectedElement({ fontSize: newSize })
                    }}
                  />
                  <span className="w-12 text-center">{fontSize}px</span>
                </div>
              </div>

              {selectedElement && elements.find((el) => el.id === selectedElement)?.type === "personList" && (
                <div className="space-y-2">
                  <Label>Line Spacing</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[lineSpacing]}
                      min={0}
                      max={40}
                      step={1}
                      onValueChange={(value) => {
                        const newSpacing = value[0]
                        handleLineSpacingChange(newSpacing)
                      }}
                    />
                    <span className="w-12 text-center">{lineSpacing}px</span>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Text Color</Label>
                <ColorPicker
                  color={textColor}
                  onChange={(color) => {
                    setTextColor(color)
                    updateSelectedElement({ color })
                  }}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
