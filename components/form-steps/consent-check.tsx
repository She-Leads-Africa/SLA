"use client"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

interface ConsentCheckProps {
  value: boolean | null
  onChange: (value: boolean) => void
  onNext: () => void
  onBack: () => void
}

export default function ConsentCheck({ value, onChange, onNext, onBack }: ConsentCheckProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[#0087DB]">Data Consent</h2>
        <p className="text-gray-600 mt-2">We need your consent to process your application.</p>
      </div>

      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="text-lg font-medium mb-4">
          Do you consent to She Leads Africa using your data for program-related communications and updates?
        </h3>

        <div className="mb-4 p-4 bg-white rounded border-l-4 border-[#0087DB]">
          <p className="text-sm text-gray-700">
            By consenting, you agree to receive emails about your application status, course updates, and relevant
            program information. We respect your privacy and will not share your data with third parties without your
            explicit consent.
          </p>
        </div>

        <RadioGroup value={value?.toString()} onValueChange={(val) => onChange(val === "true")} className="space-y-4">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="true" id="consent-yes" />
            <Label htmlFor="consent-yes" className="cursor-pointer">
              Yes, I consent to data processing
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <RadioGroupItem value="false" id="consent-no" />
            <Label htmlFor="consent-no" className="cursor-pointer">
              No, I do not consent
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
