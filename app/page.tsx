import ApplicationForm from "@/components/application-form"
import Image from "next/image"

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <Image src="/images/sla-logo.png" alt="She Leads Africa" width={300} height={120} className="h-20 w-auto" />
          </div>
          <h1 className="text-3xl font-bold text-[#0087DB]">She Leads Africa</h1>
          <p className="text-gray-600">Application Form</p>
        </div>
        <ApplicationForm />
      </div>
    </main>
  )
}
