"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AlertTriangle } from "lucide-react"

interface PersonalInfoProps {
  formData: any
  updateFormData: (field: string, value: any) => void
  onNext: () => void
  onBack: () => void
  setCurrentStep: (step: number) => void
}

const nigerianStates = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT (Federal Capital Territory)",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
]

export default function PersonalInfo({ formData, updateFormData, onNext, onBack, setCurrentStep }: PersonalInfoProps) {
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false)
  const [duplicateInfo, setDuplicateInfo] = useState<any>(null)
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)
  const [emailError, setEmailError] = useState("")

  // ✅ Email regex validation
  const validateEmail = (email: string) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return regex.test(email)
  }

  const checkEmailDuplicate = async (email: string) => {
    if (!email || !validateEmail(email)) return false

    setIsCheckingEmail(true)
    try {
      const response = await fetch("/api/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const result = await response.json()

      if (result.exists) {
        setDuplicateInfo(result.application)
        setShowDuplicateDialog(true)
        return true
      }

      return false
    } catch (error) {
      console.error("Error checking email:", error)
      return false
    } finally {
      setIsCheckingEmail(false)
    }
  }

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    updateFormData("email", value)

    if (value && !validateEmail(value)) {
      setEmailError("Please enter a valid email address (e.g. name@example.com)")
    } else {
      setEmailError("")
    }
  }

   const handleEmailBlur = async () => {
    if (formData.email && validateEmail(formData.email)) {
      await checkEmailDuplicate(formData.email)
    }
  }

  const handleNext = async () => {
    if (!validateEmail(formData.email || "")) {
      setEmailError("Please enter a valid email address before continuing")
      return
    }
    // Validate required fields
    if (
      !formData.fullName ||
      !formData.email ||
      !formData.phoneNumber ||
      !formData.dateOfBirth ||
      !formData.location ||
      !formData.locationType ||
      !formData.academicQualification ||
      !formData.employmentStatus ||
      !formData.idDocument
    ) {
      return
    }

    // Check for duplicate email before proceeding
    const isDuplicate = await checkEmailDuplicate(formData.email)
    if (!isDuplicate) {
      onNext()
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }


  const isFormValid =
    formData.fullName &&
    formData.email &&
    formData.phoneNumber &&
    formData.dateOfBirth &&
    formData.location &&
    formData.locationType &&
    formData.academicQualification &&
    formData.employmentStatus &&
    formData.idDocument &&
    validateEmail(formData.email)

    const readFileAsBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[#0087DB]">Personal Information</h2>
        <p className="text-gray-600 mt-2">Please provide your personal details.</p>
      </div>

      <div className="bg-blue-50 p-6 rounded-lg space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="fullName" className="text-sm font-medium">
              Full Name *
            </Label>
            <Input
              id="fullName"
              type="text"
              value={formData.fullName || ""}
              onChange={(e) => updateFormData("fullName", e.target.value)}
              placeholder="Enter your full name"
              className="mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-sm font-medium">
              Email Address *
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email || ""}
              onChange={handleEmailChange}
              onBlur={handleEmailBlur}
              placeholder="Enter your email address"
              className="mt-1"
              required
              disabled={isCheckingEmail}
              inputMode="email"
              pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
              title="Please enter a valid email address (e.g. name@example.com)"
            />
            {isCheckingEmail && <p className="text-xs text-gray-500 mt-1">Checking email...</p>}
            {emailError && <p className="text-xs text-red-500 mt-1">{emailError}</p>}
          </div>

          <div>
            <Label htmlFor="phoneNumber" className="text-sm font-medium">
              Phone Number *
            </Label>
            <Input
              id="phoneNumber"
              type="number"
              value={formData.phoneNumber || ""}
              onChange={(e) => updateFormData("phoneNumber", e.target.value)}
              placeholder="Enter your phone number"
              className="mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="dateOfBirth" className="text-sm font-medium">
              Date of Birth *
            </Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={formData.dateOfBirth || ""}
              onChange={(e) => updateFormData("dateOfBirth", e.target.value)}
              className="mt-1"
              required
            />
          </div>

          <div>
            <Label className="text-sm font-medium">State *</Label>
            <Select value={formData.location || ""} onValueChange={(value) => updateFormData("location", value)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select your state" />
              </SelectTrigger>
              <SelectContent>
                {nigerianStates.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium">Location Type *</Label>
            <RadioGroup
              value={formData.locationType || ""}
              onValueChange={(value) => updateFormData("locationType", value)}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="urban" id="urban" />
                <Label htmlFor="urban" className="cursor-pointer">
                  Urban
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="semi_urban" id="semi_urban" />
                <Label htmlFor="semi_urban" className="cursor-pointer">
                  Semi-Urban
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="rural" id="rural" />
                <Label htmlFor="rural" className="cursor-pointer">
                  Rural
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="col-span-full">
            <Label className="text-sm font-medium">Employment Status *</Label>
            <RadioGroup
              value={formData.employmentStatus || ""}
              onValueChange={(value) => updateFormData("employmentStatus", value)}
              className="mt-2 grid grid-cols-2 gap-4"
            >
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

          <div className="col-span-full">
            <Label htmlFor="idDocument" className="text-sm font-medium">
              ID Document *
            </Label>
           <Input
  id="idDocument"
  type="file"
  accept=".pdf,.jpg,.jpeg,.png"
  onChange={async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const data = await readFileAsBase64(file);
      updateFormData("idDocument", {
        name: file.name,
        type: file.type,
        data
      });
    } else {
      updateFormData("idDocument", null);
    }
  }}
  className="mt-1"
  required
/>
            <p className="text-xs text-gray-500 mt-1">Upload a copy of your ID document (PDF, JPG, PNG - Max 5MB)</p>
          </div>

          <div className="col-span-full">
            <Label htmlFor="cv" className="text-sm font-medium">
              CV/Resume (Optional)
            </Label>
            <Input
  id="cv"
  type="file"
  accept=".pdf,.doc,.docx"
  onChange={async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const data = await readFileAsBase64(file);
      updateFormData("cv", {
        name: file.name,
        type: file.type,
        data
      });
    } else {
      updateFormData("cv", null);
    }
  }}
  className="mt-1"
/>
            <p className="text-xs text-gray-500 mt-1">Upload your CV or resume (PDF, DOC, DOCX - Max 5MB)</p>
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium">Academic Qualification *</Label>
          <Select
            value={formData.academicQualification || ""}
            onValueChange={(value) => updateFormData("academicQualification", value)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select your highest qualification" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ssce">SSCE/WAEC/NECO</SelectItem>
              <SelectItem value="ond_nce">OND/NCE</SelectItem>
              <SelectItem value="hnd">HND</SelectItem>
              <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
              <SelectItem value="masters">Master's Degree</SelectItem>
              <SelectItem value="undergraduate">Currently an Undergraduate</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {formData.academicQualification === "undergraduate" && (
          <div>
            <Label className="text-sm font-medium">Current Level *</Label>
            <Select
              value={formData.studentLevel || ""}
              onValueChange={(value) => updateFormData("studentLevel", value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select your current level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="100_level">100 Level</SelectItem>
                <SelectItem value="200_level">200 Level</SelectItem>
                <SelectItem value="300_level">300 Level</SelectItem>
                <SelectItem value="400_level">400 Level</SelectItem>
                <SelectItem value="500_level">500 Level</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Duplicate Email Dialog */}
      <Dialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <DialogTitle>Email Already Registered</DialogTitle>
            </div>
            <DialogDescription>This email address has already been used to register for our program.</DialogDescription>
          </DialogHeader>

          {duplicateInfo && (
            <div className="space-y-4">
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <h4 className="font-medium text-amber-800 mb-2">Previous Registration Details:</h4>
                <div className="space-y-1 text-sm text-amber-700">
                  <p>
                    <strong>Name:</strong> {duplicateInfo.applicant?.full_name}
                  </p>
                  <p>
                    <strong>Course:</strong> {duplicateInfo.course?.name}
                  </p>
                  <p>
                    <strong>Status:</strong> <span className="capitalize">{duplicateInfo.status}</span>
                  </p>
                  <p>
                    <strong>Submitted:</strong> {formatDate(duplicateInfo.submitted_at)}
                  </p>
                </div>
              </div>

              <div className="text-sm text-gray-600">
                <p>
                  If you believe this is an error or you need to update your application, please contact our support
                  team at <strong>support@sheleadsafrica.org</strong>
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDuplicateDialog(false)}>
              Use Different Email
            </Button>
            <Button
              onClick={() => {
                setShowDuplicateDialog(false)
                // You could redirect to a contact form or support page here
              }}
              className="bg-[#0087DB] hover:bg-[#0076C7]"
            >
              Contact Support
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

       <div className="flex justify-between">
        <Button onClick={onBack} variant="outline">
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={!isFormValid || isCheckingEmail}
          className="bg-[#0087DB] hover:bg-[#0076C7]"
        >
          {isCheckingEmail ? "Checking..." : "Next"}
        </Button>
      </div>
    </div>
  )
}
