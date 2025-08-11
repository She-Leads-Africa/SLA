"use client"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

interface JobbermanCheckProps {
  value: boolean | null
  onChange: (value: boolean) => void
  onNext: () => void
  onBack: () => void
}

export default function JobbermanCheck({ value, onChange, onNext, onBack }: JobbermanCheckProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[#0087DB]">Job Platform</h2>
        <p className="text-gray-600 mt-2">Help us understand your job search preferences.</p>
      </div>

      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="text-lg font-medium mb-4">
          Are you interested in being connected to Jobberman for job opportunities?
        </h3>

        <div className="mb-4 p-4 bg-white rounded border-l-4 border-[#0087DB]">
          <p className="text-sm text-gray-700">
            Jobberman is Nigeria's leading job platform. We can connect you with relevant job opportunities based on
            your skills and interests.
          </p>
        </div>

        <RadioGroup value={value?.toString()} onValueChange={(val) => onChange(val === "true")} className="space-y-4">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="true" id="jobberman-yes" />
            <Label htmlFor="jobberman-yes" className="cursor-pointer">
              Yes, connect me to Jobberman
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <RadioGroupItem value="false" id="jobberman-no" />
            <Label htmlFor="jobberman-no" className="cursor-pointer">
              No, I'm not interested
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
