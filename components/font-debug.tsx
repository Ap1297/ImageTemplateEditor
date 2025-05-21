"use client"

import { useState } from "react"
import { fontOptions } from "./font-selector"

export default function FontDebug() {
  const [selectedFont, setSelectedFont] = useState("Arial")

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white p-4 border rounded shadow-lg max-w-xs">
      <h3 className="font-bold mb-2">Font Tester</h3>
      <select
        value={selectedFont}
        onChange={(e) => setSelectedFont(e.target.value)}
        className="w-full mb-2 p-2 border rounded"
      >
        {fontOptions.map((font) => (
          <option key={font.value} value={font.value}>
            {font.label}
          </option>
        ))}
      </select>
      <div className="p-2 border rounded" style={{ fontFamily: selectedFont }}>
        Sample text in {selectedFont}
      </div>
    </div>
  )
}
