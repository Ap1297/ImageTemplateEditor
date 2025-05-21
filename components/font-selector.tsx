"use client"

export const fontOptions = [
  { value: "Arial", label: "Arial" },
  { value: "Verdana", label: "Verdana" },
  { value: "Helvetica", label: "Helvetica" },
  { value: "Times New Roman", label: "Times New Roman" },
  { value: "Courier New", label: "Courier New" },
  { value: "Georgia", label: "Georgia" },
  { value: "Palatino", label: "Palatino" },
  { value: "Garamond", label: "Garamond" },
  { value: "Bookman", label: "Bookman" },
  { value: "Comic Sans MS", label: "Comic Sans MS" },
  { value: "Trebuchet MS", label: "Trebuchet MS" },
  { value: "Impact", label: "Impact" },
]

interface FontSelectorProps {
  value: string
  onChange: (value: string) => void
}

export function FontSelector({ value, onChange }: FontSelectorProps) {
  // Use a simple select element for maximum compatibility
  return (
    <div className="w-full">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        style={{ fontFamily: value }}
      >
        {fontOptions.map((font) => (
          <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
            {font.label}
          </option>
        ))}
      </select>
    </div>
  )
}
