"use client"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface ReferralSourceProps {
  value: string
  onChange: (value: string) => void
  ambassadorValue: string
  onAmbassadorChange: (value: string) => void
  onNext: () => void
  onBack: () => void
}

export default function ReferralSource({
  value,
  onChange,
  ambassadorValue,
  onAmbassadorChange,
  onNext,
  onBack,
}: ReferralSourceProps) {
  const sources = [
    { value: "sla_facebook", label: "SLA's Facebook page" },
    { value: "sla_instagram", label: "SLA's Instagram page" },
    { value: "sla_email", label: "SLA's email" },
    { value: "linkedin", label: "LinkedIn" },
    { value: "sla_ambassador", label: "SLA Ambassador" },
    { value: "others", label: "Others" },
  ]

  const ambassadors = [
    { value: "SLA-GLORIA10", label: "Gloria Ajeleke" },
    { value: "SLA-JEMIMA10", label: "Jemima Afuape" },
    { value: "SLA-ADEBUNMI10", label: "Adebunmi Ogunrombi" },
  ]

  const handleNext = () => {
    // If SLA Ambassador is selected, ensure an ambassador is chosen
    if (value === "sla_ambassador" && !ambassadorValue) {
      return // Don't proceed if no ambassador is selected
    }
    onNext()
  }

  const isNextDisabled = !value || (value === "sla_ambassador" && !ambassadorValue)

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

        {/* SLA Ambassador Sub-form */}
        {value === "sla_ambassador" && (
          <Card className="mt-6 border-[#0087DB]/20">
            <CardContent className="pt-4">
              <h4 className="text-md font-medium mb-3 text-[#0087DB]">Which SLA Ambassador referred you?</h4>
              <RadioGroup value={ambassadorValue} onValueChange={onAmbassadorChange} className="space-y-3">
                {ambassadors.map((ambassador) => (
                  <div key={ambassador.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={ambassador.value} id={ambassador.value} />
                    <Label htmlFor={ambassador.value} className="cursor-pointer">
                      <span className="font-medium">{ambassador.label}</span>
                      <span className="text-sm text-gray-500 ml-2">({ambassador.value})</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex justify-between">
        <Button onClick={onBack} variant="outline">
          Back
        </Button>
        <Button onClick={handleNext} disabled={isNextDisabled} className="bg-[#0087DB] hover:bg-[#0076C7]">
          Next
        </Button>
      </div>
    </div>
  )
}
