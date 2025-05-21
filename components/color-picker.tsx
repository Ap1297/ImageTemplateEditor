"use client"

import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface ColorPickerProps {
  color: string
  onChange: (color: string) => void
}

const PRESET_COLORS = [
  "#000000",
  "#ffffff",
  "#ff0000",
  "#00ff00",
  "#0000ff",
  "#ffff00",
  "#00ffff",
  "#ff00ff",
  "#ff9900",
  "#9900ff",
]

export function ColorPicker({ color, onChange }: ColorPickerProps) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start" style={{ backgroundColor: color }}>
          <div className="w-4 h-4 rounded mr-2 border" style={{ backgroundColor: color }} />
          {color}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="grid gap-4">
          <div className="grid grid-cols-5 gap-2">
            {PRESET_COLORS.map((presetColor) => (
              <button
                key={presetColor}
                className="w-8 h-8 rounded-md border"
                style={{ backgroundColor: presetColor }}
                onClick={() => {
                  onChange(presetColor)
                  setOpen(false)
                }}
              />
            ))}
          </div>

          <div className="flex gap-2">
            <Input type="color" value={color} onChange={(e) => onChange(e.target.value)} className="w-10 p-1 h-10" />
            <Input value={color} onChange={(e) => onChange(e.target.value)} className="flex-1" />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
