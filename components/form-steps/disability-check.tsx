"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface DisabilityCheckProps {
  formData: any
  updateFormData: (field: string, value: any) => void
  onNext: () => void
  onBack: () => void
}

export default function DisabilityCheck({ formData, updateFormData, onNext, onBack }: DisabilityCheckProps) {
  const handleNext = () => {
    // If they don't have a disability, clear the disability type
    if (!formData.hasDisability) {
      updateFormData("disabilityType", "")
    }
    onNext()
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[#0087DB]">Disability Information</h2>
        <p className="text-gray-600 mt-2">Any form of disability? If yes, what is your disability type?</p>
      </div>

      <div className="bg-blue-50 p-6 rounded-lg space-y-6">
        <div>
          <Label className="text-sm font-medium">Do you have any form of disability? *</Label>
          <RadioGroup
            value={formData.hasDisability === null ? "" : formData.hasDisability ? "yes" : "no"}
            onValueChange={(value) => updateFormData("hasDisability", value === "yes")}
            className="mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="no_disability" />
              <Label htmlFor="no_disability" className="cursor-pointer">
                No
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="has_disability" />
              <Label htmlFor="has_disability" className="cursor-pointer">
                Yes
              </Label>
            </div>
          </RadioGroup>
        </div>

        {formData.hasDisability && (
          <div>
            <Label htmlFor="disabilityType" className="text-sm font-medium">
              Please specify your disability type (Optional)
            </Label>
            <Input
              id="disabilityType"
              type="text"
              value={formData.disabilityType || ""}
              onChange={(e) => updateFormData("disabilityType", e.target.value)}
              placeholder="e.g., Visual impairment, Hearing impairment, Physical disability, etc."
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              This information helps us provide better support and accommodations if needed.
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <Button onClick={onBack} variant="outline">
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={formData.hasDisability === null}
          className="bg-[#0087DB] hover:bg-[#0076C7]"
        >
          Next
        </Button>
      </div>
    </div>
  )
}
