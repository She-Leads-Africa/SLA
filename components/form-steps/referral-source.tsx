"use client"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

interface ReferralSourceProps {
  value: string
  onChange: (value: string) => void
  onNext: () => void
  onBack: () => void
}

export default function ReferralSource({ value, onChange, onNext, onBack }: ReferralSourceProps) {
  const sources = [
    { value: "sla_facebook", label: "SLA's Facebook page" },
    { value: "sla_instagram", label: "SLA's Instagram page" },
    { value: "sla_email", label: "SLA's email" },
    { value: "linkedin", label: "LinkedIn" },
    { value: "others", label: "Others" },
  ]

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[#0087DB]">How Did You Hear About Us?</h2>
        <p className="text-gray-600 mt-2">Help us understand how you discovered this program.</p>
      </div>

      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="text-lg font-medium mb-4">Where did you hear about this program?</h3>

        <RadioGroup value={value} onValueChange={onChange} className="space-y-4">
          {sources.map((source) => (
            <div key={source.value} className="flex items-center space-x-2">
              <RadioGroupItem value={source.value} id={source.value} />
              <Label htmlFor={source.value} className="cursor-pointer">
                {source.label}
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
