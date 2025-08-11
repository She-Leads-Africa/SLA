"use client"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

interface DisabilityTypeProps {
  value: string
  onChange: (value: string) => void
  onNext: () => void
  onBack: () => void
}

export default function DisabilityType({ value, onChange, onNext, onBack }: DisabilityTypeProps) {
  const disabilityTypes = [
    "Visual impairment",
    "Hearing impairment",
    "Physical/mobility impairment",
    "Cognitive/learning disability",
    "Speech impairment",
    "Other",
  ]

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[#0087DB]">Disability Type</h2>
        <p className="text-gray-600 mt-2">Please specify your disability type to help us provide better support.</p>
      </div>

      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="text-lg font-medium mb-4">What type of disability do you have?</h3>

        <RadioGroup value={value} onValueChange={onChange} className="space-y-4">
          {disabilityTypes.map((type) => (
            <div key={type} className="flex items-center space-x-2">
              <RadioGroupItem value={type} id={type.replace(/\s+/g, "-").toLowerCase()} />
              <Label htmlFor={type.replace(/\s+/g, "-").toLowerCase()} className="cursor-pointer">
                {type}
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
