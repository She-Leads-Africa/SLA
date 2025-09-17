"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import EligibilityCheck from "./form-steps/eligibility-check"
import PathwaySelection from "./form-steps/pathway-selection"
import BusinessCheck from "./form-steps/business-check"
import BusinessSector from "./form-steps/business-sector"
import CompanyInfo from "./form-steps/company-info"
import BoosterCourseCheck from "./form-steps/booster-course-check"
import ConsentCheck from "./form-steps/consent-check"
import PersonalInfo from "./form-steps/personal-info"
import WorkInterestCheck from "./form-steps/work-interest-check"
import DisplacementCheck from "./form-steps/displacement-check"
import DisabilityCheck from "./form-steps/disability-check"
import ReferralSource from "./form-steps/referral-source"
import CourseSelection from "./form-steps/course-selection"
import CourseSpecificQuestions from "./form-steps/course-specific-questions"
import Disqualification from "./form-steps/disqualification"
import CourseDetails from "./form-steps/course-details"
import ProgressBar from "./progress-bar"
import { useToast } from "@/hooks/use-toast"

export default function ApplicationForm() {
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Eligibility
    isEligible: null,

    // Pathway
    pathway: "",

    // Business information
    businessStatus: "", // has_business_less_3, has_business_more_3, no_business
    businessSector: "",
    companyName: "",

    // Employment (now part of personal info)
    employmentStatus: "",

    // Previous experience
    takenBoosterCourse: null,

    // Consent
    consentToDataUse: null,

    // Personal information
    fullName: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
    location: "",
    locationType: "",
    idDocument: null,
    cv: null,
    academicQualification: "",
    studentLevel: "",

    // Additional questions
    workInterest: null,
    isDisplaced: null,
    hasDisability: null,
    disabilityType: "",
    referralSource: "",
    ambassadorCode: "",

    // Course selection
    preferredCourse: "",

    // Course-specific questions
    hasFormalTraining: null,
    familiarityScale: "",
    hasUsedTools: null,
    toolsUsed: "",
    courseSpecificAnswer: "",
    socialMediaPlatforms: [],
    digitalStrategies: [],
    otherPlatform: "",
    expectations: "",
    applicationEaseRating: "",
  })

  const totalSteps = 20
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionComplete, setSubmissionComplete] = useState(false)
  const [submittedCourseId, setSubmittedCourseId] = useState(null)

  const updateFormData = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleNext = () => {
    setCurrentStep((prev) => prev + 1)
    window.scrollTo(0, 0)
  }

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1)
    window.scrollTo(0, 0)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/submit-application", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "🎉 Application Approved!",
          description:
            "Congratulations! Your application has been automatically approved. Check your email for course details.",
        })

        if (result.courseId) {
          setSubmittedCourseId(result.courseId)
        }

        setSubmissionComplete(true)
        setCurrentStep(totalSteps)
      } else {
        toast({
          title: "Submission Failed",
          description: result.error || "There was an error submitting your application. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Form submission error:", error)
      toast({
        title: "Submission Failed",
        description: "There was an unexpected error submitting your application. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Logic to determine which step to show
  const renderStep = () => {
    // Disqualification logic
    if (
      formData.isEligible === false ||
      formData.businessStatus === "has_business_more_3" ||
      formData.takenBoosterCourse === true
      //formData.consentToDataUse === false ||
      //formData.workInterest === false
    ) {
      return <Disqualification />
    }

    // If submission is complete, show course details
    if (submissionComplete && currentStep === totalSteps) {
      return <CourseDetails selectedCourse={formData.preferredCourse} courseId={submittedCourseId} />
    }

    switch (currentStep) {
      case 1:
        return (
          <EligibilityCheck
            value={formData.isEligible}
            onChange={(value) => updateFormData("isEligible", value)}
            onNext={handleNext}
          />
        )
      case 2:
        return (
          <PathwaySelection
            value={formData.pathway}
            onChange={(value) => updateFormData("pathway", value)}
            onNext={handleNext}
            onBack={handleBack}
          />
        )
      case 3:
        // Only show for entrepreneurship pathway
        if (formData.pathway === "entrepreneurship") {
          return (
            <BusinessCheck
              value={formData.businessStatus}
              onChange={(value) => updateFormData("businessStatus", value)}
              onNext={handleNext}
              onBack={handleBack}
            />
          )
        } else {
          // Skip to booster course check for professional pathway
          setCurrentStep(6)
          return null
        }
      case 4:
        // Only show if they have a business less than 3 years old
        if (formData.businessStatus === "has_business_less_3") {
          return (
            <BusinessSector
              value={formData.businessSector}
              onChange={(value) => updateFormData("businessSector", value)}
              onNext={handleNext}
              onBack={handleBack}
            />
          )
        } else {
          // Skip to booster course check
          setCurrentStep(6)
          return null
        }
      case 5:
        // Only show if they have a business less than 3 years old (business name)
        if (formData.businessStatus === "has_business_less_3") {
          return (
            <CompanyInfo
              value={formData.companyName}
              onChange={(value) => updateFormData("companyName", value)}
              onNext={handleNext}
              onBack={handleBack}
            />
          )
        } else {
          // Skip to booster course check
          setCurrentStep(6)
          return null
        }
      case 6:
        return (
          <BoosterCourseCheck
            value={formData.takenBoosterCourse}
            onChange={(value) => updateFormData("takenBoosterCourse", value)}
            onNext={handleNext}
            onBack={() => {
              if (formData.pathway === "entrepreneurship") {
                if (formData.businessStatus === "has_business_less_3") {
                  setCurrentStep(5) // Go back to company info
                } else {
                  setCurrentStep(3) // Go back to business check
                }
              } else {
                setCurrentStep(2) // Go back to pathway selection
              }
            }}
          />
        )
      case 7:
        return (
          <ConsentCheck
            value={formData.consentToDataUse}
            onChange={(value) => updateFormData("consentToDataUse", value)}
            onNext={handleNext}
            onBack={handleBack}
          />
        )
      case 8:
        return (
          <PersonalInfo
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNext}
            onBack={handleBack}
            setCurrentStep={setCurrentStep}
          />
        )
      case 9:
        return (
          <WorkInterestCheck
            value={formData.workInterest}
            onChange={(value) => updateFormData("workInterest", value)}
            onNext={handleNext}
            onBack={handleBack}
          />
        )
      case 10:
        return (
          <DisplacementCheck
            value={formData.isDisplaced}
            onChange={(value) => updateFormData("isDisplaced", value)}
            onNext={handleNext}
            onBack={handleBack}
          />
        )
      case 11:
        return (
          <DisabilityCheck
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNext}
            onBack={handleBack}
          />
        )
      case 12:
        return (
          <ReferralSource
            value={formData.referralSource}
           onChange={(value) => {
              updateFormData("referralSource", value)
              // Clear ambassador code if not selecting SLA Ambassador
              if (value !== "sla_ambassador") {
                updateFormData("ambassadorCode", "")
              }
            }}
            ambassadorValue={formData.ambassadorCode}
            onAmbassadorChange={(value) => updateFormData("ambassadorCode", value)}
            onNext={handleNext}
            onBack={handleBack}
          />
        )
      case 13:
        return (
          <CourseSelection
            value={formData.preferredCourse}
            onChange={(value) => updateFormData("preferredCourse", value)}
            onNext={handleNext}
            onBack={handleBack}
            isSubmitting={false}
          />
        )
      case 14:
        return (
          <CourseSpecificQuestions
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleSubmit}
            onBack={handleBack}
            isSubmitting={isSubmitting}
          />
        )
      case 15:
        return submissionComplete ? (
          <CourseDetails selectedCourse={formData.preferredCourse} courseId={submittedCourseId} />
        ) : (
          <div>Loading...</div>
        )
      default:
        return null
    }
  }

  // Calculate progress percentage
  const progress = (currentStep / totalSteps) * 100

  return (
    <div className="max-w-2xl mx-auto">
      <ProgressBar progress={progress} />
      <Card className="mt-4">
        <CardContent className="pt-6">{renderStep()}</CardContent>
      </Card>
    </div>
  )
}
