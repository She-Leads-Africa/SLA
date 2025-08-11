"use client"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

interface DisplacementCheckProps {
  value: boolean | null
  onChange: (value: boolean) => void
  onNext: () => void
  onBack: () => void
}

export default function DisplacementCheck({ value, onChange, onNext, onBack }: DisplacementCheckProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[#0087DB]">Displacement Status</h2>
        <p className="text-gray-600 mt-2">This information helps us understand your background.</p>
      </div>

      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="text-lg font-medium mb-4">Are you internally displaced within Nigeria?</h3>

        <div className="mb-4 p-4 bg-white rounded border-l-4 border-[#0087DB]">
          <p className="text-sm text-gray-700">
            This information is collected to help us better understand our participants and provide appropriate support
            where needed.
          </p>
        </div>

        <RadioGroup value={value?.toString()} onValueChange={(val) => onChange(val === "true")} className="space-y-4">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="true" id="displaced-yes" />
            <Label htmlFor="displaced-yes" className="cursor-pointer">
              Yes, I am internally displaced
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <RadioGroupItem value="false" id="displaced-no" />
            <Label htmlFor="displaced-no" className="cursor-pointer">
              No, I am not internally displaced
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="flex justify-between">
        <Button onClick={onBack} variant="outline">
          Back
        </Button>
        <Button onClick={onNext} disabled={value === null} className="bg-[#0087DB] hover:bg-[#0076C7]">
          Next
        </Button>
      </div>
    </div>
  )
}
