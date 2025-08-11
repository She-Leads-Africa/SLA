"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Edit, Calendar, Clock, RefreshCw, Settings, Trash2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

interface Course {
  id: number
  name: string
  description: string
  schedule: string
  start_date: string
  duration: string
  location: string
  tutor: string
  class_link?: string
  tutor_bio?: string
  requirements?: string
  created_at: string
}

interface CourseQuestion {
  id?: number
  course_id: number
  question_type: string
  question_text: string
  question_options?: string[]
  is_required: boolean
  display_order: number
}

const questionTypes = [
  { value: "formal_training", label: "Formal Training" },
  { value: "familiarity_scale", label: "Familiarity Scale" },
  { value: "tools_used", label: "Tools Used" },
  { value: "specific_question", label: "Course Specific Question" },
  { value: "expectations", label: "Expectations" },
  { value: "ease_rating", label: "Application Ease Rating" },
]

export default function CoursesPage() {
  const { toast } = useToast()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isQuestionsDialogOpen, setIsQuestionsDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentCourse, setCurrentCourse] = useState<Partial<Course>>({})
  const [courseQuestions, setCourseQuestions] = useState<CourseQuestion[]>([])
  const [selectedCourseForQuestions, setSelectedCourseForQuestions] = useState<Course | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      setLoading(true)

      if (!supabase.from) {
        console.error("Supabase client not properly initialized")
        toast({
          title: "Connection Error",
          description: "Could not connect to the database. Please check your configuration.",
          variant: "destructive",
        })
        setCourses([])
        setLoading(false)
        return
      }

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false })
        .abortSignal(controller.signal)

      clearTimeout(timeoutId)

      if (error) {
        throw error
      }

      setCourses(data || [])
    } catch (error: any) {
      console.error("Error fetching courses:", error)

      if (error.name === "AbortError") {
        toast({
          title: "Timeout Error",
          description: "Request timed out. Please check your connection and try again.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to load courses. Please check your database connection.",
          variant: "destructive",
        })
      }
      setCourses([])
    } finally {
      setLoading(false)
    }
  }

  const fetchCourseQuestions = async (courseId: number) => {
    try {
      const { data, error } = await supabase
        .from("course_questions")
        .select("*")
        .eq("course_id", courseId)
        .order("display_order", { ascending: true })

      if (error) {
        throw error
      }

      const questions = (data || []).map((q) => ({
        ...q,
        question_options: q.question_options ? JSON.parse(q.question_options) : [],
      }))

      setCourseQuestions(questions)
    } catch (error: any) {
      console.error("Error fetching course questions:", error)
      toast({
        title: "Error",
        description: "Failed to load course questions.",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      if (!supabase.from) {
        toast({
          title: "Connection Error",
          description: "Could not connect to the database. Please check your configuration.",
          variant: "destructive",
        })
        return
      }

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000)

      if (isEditing && currentCourse.id) {
        const { error } = await supabase
          .from("courses")
          .update({
            name: currentCourse.name,
            description: currentCourse.description,
            schedule: currentCourse.schedule,
            start_date: currentCourse.start_date,
            duration: currentCourse.duration,
            location: currentCourse.location,
            tutor: currentCourse.tutor,
            class_link: currentCourse.class_link,
            tutor_bio: currentCourse.tutor_bio,
            requirements: currentCourse.requirements,
          })
          .eq("id", currentCourse.id)
          .abortSignal(controller.signal)

        clearTimeout(timeoutId)

        if (error) throw error

        toast({
          title: "Course Updated",
          description: "The course has been updated successfully",
        })
      } else {
        const { data, error } = await supabase
          .from("courses")
          .insert([
            {
              name: currentCourse.name,
              description: currentCourse.description,
              schedule: currentCourse.schedule,
              start_date: currentCourse.start_date,
              duration: currentCourse.duration,
              location: currentCourse.location,
              tutor: currentCourse.tutor,
              class_link: currentCourse.class_link || "https://meet.google.com/sla-default",
              tutor_bio: currentCourse.tutor_bio || "Experienced instructor",
              requirements: currentCourse.requirements || "Laptop with stable internet connection",
            },
          ])
          .select()
          .abortSignal(controller.signal)

        clearTimeout(timeoutId)

        if (error) throw error

        // Create default questions for new course
        if (data && data[0]) {
          await createDefaultQuestions(data[0].id)
        }

        toast({
          title: "Course Created",
          description: "The course has been created successfully with default questions",
        })
      }

      setCurrentCourse({})
      setIsDialogOpen(false)
      fetchCourses()
    } catch (error: any) {
      console.error("Error saving course:", error)

      if (error.name === "AbortError") {
        toast({
          title: "Timeout Error",
          description: "Operation timed out. Please try again.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to save course. Please check your database connection.",
          variant: "destructive",
        })
      }
    } finally {
      setSaving(false)
    }
  }

  const createDefaultQuestions = async (courseId: number) => {
    const defaultQuestions = [
      {
        course_id: courseId,
        question_type: "formal_training",
        question_text: `Have you received any formal training in ${currentCourse.name}?`,
        question_options: JSON.stringify(["Yes", "No"]),
        display_order: 1,
      },
      {
        course_id: courseId,
        question_type: "familiarity_scale",
        question_text: `On a scale of 1 to 5, how familiar are you with ${currentCourse.name}?`,
        question_options: JSON.stringify([
          "1 - Not Familiar",
          "2 - Slightly Familiar",
          "3 - Moderately Familiar",
          "4 - Very Familiar",
          "5 - Extremely Familiar",
        ]),
        display_order: 2,
      },
      {
        course_id: courseId,
        question_type: "tools_used",
        question_text: `Have you used any tools related to ${currentCourse.name}?`,
        question_options: JSON.stringify(["Yes", "No"]),
        display_order: 3,
      },
      {
        course_id: courseId,
        question_type: "specific_question",
        question_text: `What interests you most about ${currentCourse.name}?`,
        question_options: JSON.stringify([
          "Learning new skills",
          "Career advancement",
          "Personal interest",
          "Business application",
        ]),
        display_order: 4,
      },
      {
        course_id: courseId,
        question_type: "expectations",
        question_text: "What are your expectations for this class?",
        question_options: null,
        display_order: 5,
      },
      {
        course_id: courseId,
        question_type: "ease_rating",
        question_text: "How easy was it for you to apply for this SLA Booster Live Masterclass?",
        question_options: JSON.stringify([
          "1 - Very difficult",
          "2 - Difficult",
          "3 - Neutral",
          "4 - Easy",
          "5 - Very easy",
        ]),
        display_order: 6,
      },
    ]

    try {
      const { error } = await supabase.from("course_questions").insert(defaultQuestions)

      if (error) {
        console.error("Error creating default questions:", error)
      }
    } catch (error) {
      console.error("Error creating default questions:", error)
    }
  }

  const handleEdit = (course: Course) => {
    setCurrentCourse(course)
    setIsEditing(true)
    setIsDialogOpen(true)
  }

  const handleAddNew = () => {
    setCurrentCourse({})
    setIsEditing(false)
    setIsDialogOpen(true)
  }

  const handleManageQuestions = (course: Course) => {
    setSelectedCourseForQuestions(course)
    fetchCourseQuestions(course.id)
    setIsQuestionsDialogOpen(true)
  }

  const handleSaveQuestions = async () => {
    if (!selectedCourseForQuestions) return

    setSaving(true)
    try {
      // Delete existing questions
      await supabase.from("course_questions").delete().eq("course_id", selectedCourseForQuestions.id)

      // Insert updated questions
      const questionsToInsert = courseQuestions.map((q) => ({
        course_id: selectedCourseForQuestions.id,
        question_type: q.question_type,
        question_text: q.question_text,
        question_options:
          q.question_options && q.question_options.length > 0 ? JSON.stringify(q.question_options) : null,
        is_required: q.is_required,
        display_order: q.display_order,
      }))

      const { error } = await supabase.from("course_questions").insert(questionsToInsert)

      if (error) throw error

      toast({
        title: "Questions Updated",
        description: "Course questions have been updated successfully",
      })

      setIsQuestionsDialogOpen(false)
    } catch (error: any) {
      console.error("Error saving questions:", error)
      toast({
        title: "Error",
        description: "Failed to save questions.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const addQuestion = () => {
    const newQuestion: CourseQuestion = {
      course_id: selectedCourseForQuestions?.id || 0,
      question_type: "specific_question",
      question_text: "",
      question_options: [],
      is_required: true,
      display_order: courseQuestions.length + 1,
    }
    setCourseQuestions([...courseQuestions, newQuestion])
  }

  const updateQuestion = (index: number, field: keyof CourseQuestion, value: any) => {
    const updated = [...courseQuestions]
    updated[index] = { ...updated[index], [field]: value }
    setCourseQuestions(updated)
  }

  const removeQuestion = (index: number) => {
    const updated = courseQuestions.filter((_, i) => i !== index)
    setCourseQuestions(updated)
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setCurrentCourse((prevCourse) => ({
      ...prevCourse,
      [name]: value,
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">Courses</h2>
          <p className="text-gray-500">Manage available courses and their questions</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchCourses} variant="outline" disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAddNew} className="bg-[#0087DB] hover:bg-[#0076C7]">
                <Plus className="mr-2 h-4 w-4" />
                Add Course
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>{isEditing ? "Edit Course" : "Add New Course"}</DialogTitle>
                  <DialogDescription>
                    {isEditing ? "Update the course details below" : "Fill in the details below to create a new course"}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Course Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={currentCourse.name || ""}
                      onChange={handleInputChange}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={currentCourse.description || ""}
                      onChange={handleInputChange}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="schedule" className="text-right">
                      Schedule
                    </Label>
                    <Input
                      id="schedule"
                      name="schedule"
                      value={currentCourse.schedule || ""}
                      onChange={handleInputChange}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="start_date" className="text-right">
                      Start Date
                    </Label>
                    <Input
                      id="start_date"
                      name="start_date"
                      type="date"
                      value={currentCourse.start_date || ""}
                      onChange={handleInputChange}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="duration" className="text-right">
                      Duration
                    </Label>
                    <Input
                      id="duration"
                      name="duration"
                      value={currentCourse.duration || ""}
                      onChange={handleInputChange}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="location" className="text-right">
                      Location
                    </Label>
                    <Input
                      id="location"
                      name="location"
                      value={currentCourse.location || ""}
                      onChange={handleInputChange}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="tutor" className="text-right">
                      Tutor
                    </Label>
                    <Input
                      id="tutor"
                      name="tutor"
                      value={currentCourse.tutor || ""}
                      onChange={handleInputChange}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="class_link" className="text-right">
                      Class Link
                    </Label>
                    <Input
                      id="class_link"
                      name="class_link"
                      value={currentCourse.class_link || ""}
                      onChange={handleInputChange}
                      className="col-span-3"
                      placeholder="https://meet.google.com/..."
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="tutor_bio" className="text-right">
                      Tutor Bio
                    </Label>
                    <Textarea
                      id="tutor_bio"
                      name="tutor_bio"
                      value={currentCourse.tutor_bio || ""}
                      onChange={handleInputChange}
                      className="col-span-3"
                      placeholder="Brief bio about the tutor..."
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="requirements" className="text-right">
                      Requirements
                    </Label>
                    <Textarea
                      id="requirements"
                      name="requirements"
                      value={currentCourse.requirements || ""}
                      onChange={handleInputChange}
                      className="col-span-3"
                      placeholder="Course requirements..."
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" className="bg-[#0087DB] hover:bg-[#0076C7]" disabled={saving}>
                    {saving ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        {isEditing ? "Updating..." : "Creating..."}
                      </>
                    ) : isEditing ? (
                      "Update Course"
                    ) : (
                      "Add Course"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Questions Management Dialog */}
      <Dialog open={isQuestionsDialogOpen} onOpenChange={setIsQuestionsDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Course Questions - {selectedCourseForQuestions?.name}</DialogTitle>
            <DialogDescription>
              Configure the questions that will be asked to applicants for this course
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {courseQuestions.map((question, index) => (
              <Card key={index} className="p-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 space-y-4">
                      <div>
                        <Label>Question Type</Label>
                        <Select
                          value={question.question_type}
                          onValueChange={(value) => updateQuestion(index, "question_type", value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {questionTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Question Text</Label>
                        <Textarea
                          value={question.question_text}
                          onChange={(e) => updateQuestion(index, "question_text", e.target.value)}
                          placeholder="Enter the question text"
                        />
                      </div>

                      <div>
                        <Label>Options (one per line, leave empty for text input)</Label>
                        <Textarea
                          value={question.question_options?.join("\n") || ""}
                          onChange={(e) =>
                            updateQuestion(
                              index,
                              "question_options",
                              e.target.value.split("\n").filter((o) => o.trim()),
                            )
                          }
                          placeholder="Option 1&#10;Option 2&#10;Option 3"
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`required-${index}`}
                          checked={question.is_required}
                          onCheckedChange={(checked) => updateQuestion(index, "is_required", checked)}
                        />
                        <Label htmlFor={`required-${index}`}>Required</Label>
                      </div>
                    </div>

                    <Button variant="outline" size="sm" onClick={() => removeQuestion(index)} className="ml-4">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}

            <Button onClick={addQuestion} variant="outline" className="w-full bg-transparent">
              <Plus className="mr-2 h-4 w-4" />
              Add Question
            </Button>
          </div>

          <DialogFooter>
            <Button onClick={handleSaveQuestions} className="bg-[#0087DB] hover:bg-[#0076C7]" disabled={saving}>
              {saving ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Questions"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#0087DB] border-r-transparent"></div>
              <p className="mt-2 text-gray-500">Loading courses...</p>
            </div>
          ) : courses.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No courses found</p>
              <Button onClick={handleAddNew} className="mt-4 bg-[#0087DB] hover:bg-[#0076C7]">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Course
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course Name</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Tutor</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium">{course.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4 text-gray-500" />
                        {course.schedule}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                        {formatDate(course.start_date)}
                      </div>
                    </TableCell>
                    <TableCell>{course.duration}</TableCell>
                    <TableCell>{course.tutor}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleManageQuestions(course)}>
                          <Settings className="h-4 w-4 mr-1" />
                          Questions
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(course)}>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
