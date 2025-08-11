"use client"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

interface EmploymentStatusProps {
  value: string
  onChange: (value: string) => void
  onNext: () => void
  onBack: () => void
}

export default function EmploymentStatus({ value, onChange, onNext, onBack }: EmploymentStatusProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[#0087DB]">Employment Status</h2>
        <p className="text-gray-600 mt-2">What is your current employment status?</p>
      </div>

      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="text-lg font-medium mb-4">Select your employment status</h3>

        <RadioGroup value={value} onValueChange={onChange} className="space-y-4">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="unemployed" id="unemployed" />
            <Label htmlFor="unemployed" className="cursor-pointer">
              Unemployed
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <RadioGroupItem value="self_employed" id="self_employed" />
            <Label htmlFor="self_employed" className="cursor-pointer">
              Self-employed
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <RadioGroupItem value="employed" id="employed" />
            <Label htmlFor="employed" className="cursor-pointer">
              Employed
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <RadioGroupItem value="student" id="student" />
            <Label htmlFor="student" className="cursor-pointer">
              Student
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
