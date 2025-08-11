"use client"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

interface LocationCheckProps {
  value: boolean | null
  onChange: (value: boolean) => void
  onNext: () => void
  onBack: () => void
}

export default function LocationCheck({ value, onChange, onNext, onBack }: LocationCheckProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[#0087DB]">Location Verification</h2>
        <p className="text-gray-600 mt-2">Please confirm your location to continue.</p>
      </div>

      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="text-lg font-medium mb-4">Are you currently residing in Africa?</h3>

        <RadioGroup value={value?.toString()} onValueChange={(val) => onChange(val === "true")} className="space-y-4">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="true" id="location-yes" />
            <Label htmlFor="location-yes" className="cursor-pointer">
              Yes, I am currently residing in Africa
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <RadioGroupItem value="false" id="location-no" />
            <Label htmlFor="location-no" className="cursor-pointer">
              No, I am not currently residing in Africa
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
