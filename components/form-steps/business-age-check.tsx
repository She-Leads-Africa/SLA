"use client"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

interface BusinessAgeCheckProps {
  value: string
  onChange: (value: string) => void
  onNext: () => void
  onBack: () => void
}

export default function BusinessAgeCheck({ value, onChange, onNext, onBack }: BusinessAgeCheckProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[#0087DB]">Business Information</h2>
        <p className="text-gray-600 mt-2">Tell us about your business experience.</p>
      </div>

      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="text-lg font-medium mb-4">Do you currently have a business?</h3>

        <RadioGroup value={value} onValueChange={onChange} className="space-y-4">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="has_business_less_3" id="has_business_less_3" />
            <Label htmlFor="has_business_less_3" className="cursor-pointer">
              Yes, I have a business that is less than 3 years old
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <RadioGroupItem value="has_business_more_3" id="has_business_more_3" />
            <Label htmlFor="has_business_more_3" className="cursor-pointer">
              Yes, I have a business that is more than 3 years old
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no_business" id="no_business" />
            <Label htmlFor="no_business" className="cursor-pointer">
              No, I don't have a business
            </Label>
          </div>
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
