"use client"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

interface AgeCheckProps {
  value: boolean | null
  onChange: (value: boolean) => void
  onNext: () => void
}

export default function AgeCheck({ value, onChange, onNext }: AgeCheckProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[#0087DB]">Age Verification</h2>
        <p className="text-gray-600 mt-2">Please confirm your age to continue.</p>
      </div>

      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="text-lg font-medium mb-4">Are you between 18 and 35 years old?</h3>

        <RadioGroup value={value?.toString()} onValueChange={(val) => onChange(val === "true")} className="space-y-4">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="true" id="age-yes" />
            <Label htmlFor="age-yes" className="cursor-pointer">
              Yes, I am between 18 and 35 years old
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <RadioGroupItem value="false" id="age-no" />
            <Label htmlFor="age-no" className="cursor-pointer">
              No, I am not in this age range
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="flex justify-end">
        <Button onClick={onNext} disabled={value === null} className="bg-[#0087DB] hover:bg-[#0076C7]">
          Next
        </Button>
      </div>
    </div>
  )
}
