"use client"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

interface BusinessSectorProps {
  value: string
  onChange: (value: string) => void
  onNext: () => void
  onBack: () => void
}

export default function BusinessSector({ value, onChange, onNext, onBack }: BusinessSectorProps) {
  const sectors = [
    "agriculture",
    "technology",
    "healthcare",
    "education",
    "retail",
    "manufacturing",
    "services",
    "creative_arts",
    "food_beverage",
    "fashion",
    "other",
  ]

  const formatSectorName = (sector: string) => {
    return sector
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[#0087DB]">Business Sector</h2>
        <p className="text-gray-600 mt-2">What sector is your business in?</p>
      </div>

      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="text-lg font-medium mb-4">Select your business sector</h3>

        <RadioGroup value={value} onValueChange={onChange} className="space-y-4">
          {sectors.map((sector) => (
            <div key={sector} className="flex items-center space-x-2">
              <RadioGroupItem value={sector} id={sector} />
              <Label htmlFor={sector} className="cursor-pointer">
                {formatSectorName(sector)}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="flex justify-between">
        <Button onClick={onBack} variant="outline">
          Back
        </Button>
        <Button onClick={onNext} disabled={!value} className="bg-[#0087DB] hover:bg-[#0076C7]">
          Next
        </Button>
      </div>
    </div>
  )
}
