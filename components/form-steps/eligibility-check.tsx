"use client"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

interface EligibilityCheckProps {
  value: boolean | null
  onChange: (value: boolean) => void
  onNext: () => void
}

export default function EligibilityCheck({ value, onChange, onNext }: EligibilityCheckProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[#0087DB]">Eligibility Check</h2>
        <p className="text-gray-600 mt-2">Let's check if you meet our basic requirements.</p>
      </div>

      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="text-lg font-medium mb-4">Are you a Nigerian Female aged 18 to 35 based in Nigeria?</h3>

        <RadioGroup value={value?.toString()} onValueChange={(val) => onChange(val === "true")} className="space-y-4">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="true" id="eligible-yes" />
            <Label htmlFor="eligible-yes" className="cursor-pointer">
              Yes, I meet these requirements
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <RadioGroupItem value="false" id="eligible-no" />
            <Label htmlFor="eligible-no" className="cursor-pointer">
              No, I don't meet these requirements
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
