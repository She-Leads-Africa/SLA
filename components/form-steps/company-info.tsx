"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

interface CompanyInfoProps {
  value: string
  onChange: (value: string) => void
  onNext: () => void
  onBack: () => void
}

export default function CompanyInfo({ value, onChange, onNext, onBack }: CompanyInfoProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[#0087DB]">Company Information</h2>
        <p className="text-gray-600 mt-2">Please provide your company details.</p>
      </div>

      <div className="bg-blue-50 p-6 rounded-lg">
        <div className="space-y-4">
          <div>
            <Label htmlFor="company-name" className="text-sm font-medium">
              Company/Brand Name *
            </Label>
            <Input
              id="company-name"
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Enter your company name"
              className="mt-1"
              required
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button onClick={onBack} variant="outline">
          Back
        </Button>
        <Button onClick={onNext} disabled={!value.trim()} className="bg-[#0087DB] hover:bg-[#0076C7]">
          Next
        </Button>
      </div>
    </div>
  )
}
