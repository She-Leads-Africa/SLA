"use client"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

interface WorkInterestCheckProps {
  value: boolean | null
  onChange: (value: boolean) => void
  onNext: () => void
  onBack: () => void
}

export default function WorkInterestCheck({ value, onChange, onNext, onBack }: WorkInterestCheckProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[#0087DB]">Work Interest</h2>
        <p className="text-gray-600 mt-2">Tell us about your work intentions.</p>
      </div>

      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="text-lg font-medium mb-4">Are you interested in working or starting a business after completing this course?</h3>

        <RadioGroup value={value?.toString()} onValueChange={(val) => onChange(val === "true")} className="space-y-4">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="true" id="work-yes" />
            <Label htmlFor="work-yes" className="cursor-pointer">
              Yes, I am interested in working or starting a business after the course
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <RadioGroupItem value="false" id="work-no" />
            <Label htmlFor="work-no" className="cursor-pointer">
              No, I am not interested in working or starting a business after the course
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
