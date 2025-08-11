"use client"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

interface PathwaySelectionProps {
  value: string
  onChange: (value: string) => void
  onNext: () => void
  onBack: () => void
}

export default function PathwaySelection({ value, onChange, onNext, onBack }: PathwaySelectionProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[#0087DB]">Pathway Selection</h2>
        <p className="text-gray-600 mt-2">Choose your preferred pathway.</p>
      </div>

      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="text-lg font-medium mb-4">Which pathway would you be interested in?</h3>

        <RadioGroup value={value} onValueChange={onChange} className="space-y-4">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="entrepreneurship" id="entrepreneurship" />
            <Label htmlFor="entrepreneurship" className="cursor-pointer">
              <span className="font-medium">Entrepreneurship</span>
              <p className="text-sm text-gray-600">For those interested in starting or growing their business</p>
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <RadioGroupItem value="professional" id="professional" />
            <Label htmlFor="professional" className="cursor-pointer">
              <span className="font-medium">Professional Development</span>
              <p className="text-sm text-gray-600">For those looking to advance their career or gain new skills</p>
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
