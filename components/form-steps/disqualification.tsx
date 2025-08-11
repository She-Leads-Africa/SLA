import { XCircle } from "lucide-react"

export default function Disqualification() {
  return (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <div className="rounded-full bg-red-100 p-6">
          <XCircle className="h-16 w-16 text-red-600" />
        </div>
      </div>

      <div>
        <h2 className="text-3xl font-bold text-red-600 mb-4">Application Not Eligible</h2>
        <p className="text-xl text-gray-700 mb-2">
          Thank you for your interest, but based on your answer you do not qualify.
        </p>
      </div>

      <div className="bg-red-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-red-700 mb-3">Possible Reasons:</h3>
        <div className="space-y-2 text-left text-sm">
          <p className="flex items-center">
            <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
            You may not meet the age requirements (18-35 years)
          </p>
          <p className="flex items-center">
            <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
            Your business may be older than 3 years (for entrepreneurship pathway)
          </p>
          <p className="flex items-center">
            <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
            You may not have consented to data processing
          </p>
          <p className="flex items-center">
            <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
            You may not be interested in working after the course
          </p>
        </div>
      </div>

      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-[#0087DB] mb-3">Don't Give Up!</h3>
        <p className="text-sm text-gray-700">
          Keep an eye on our website and social media for future programs that might be a better fit for your profile.
          We regularly launch new initiatives and courses.
        </p>
      </div>

      <div className="text-sm text-gray-500">
        <p>For questions about eligibility, contact us at info@sheleadsafrica.org</p>
      </div>
    </div>
  )
}
