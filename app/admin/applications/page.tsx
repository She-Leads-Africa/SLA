"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { getApplications, getApplicationsForExport } from "@/app/actions"
import { downloadExcel } from "@/lib/excel-export"
import { Eye, Download, Filter, FileSpreadsheet, Calendar } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"

interface Application {
  id: number
  status: string
  submitted_at: string
  applicant: {
    full_name: string
    email: string
    phone_number: string
    location: string
  }
  course: {
    name: string
  }
  pathway: string
}

export default function ApplicationsPage() {
  const { toast } = useToast()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [dateFilter, setDateFilter] = useState<{ from?: Date; to?: Date }>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const data = await getApplications(statusFilter === "all" ? undefined : statusFilter)
        setApplications(data)
      } catch (error) {
        console.error("Error fetching applications:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchApplications()
  }, [statusFilter])

  // Filter applications based on search term and date range
  const filteredApplications = applications.filter((app) => {
    const matchesSearch = 
      app.applicant.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.course.name.toLowerCase().includes(searchTerm.toLowerCase())

    const submissionDate = new Date(app.submitted_at)
    const matchesDate = 
      (!dateFilter.from || submissionDate >= dateFilter.from) &&
      (!dateFilter.to || submissionDate <= new Date(dateFilter.to.setHours(23, 59, 59, 999)))

    return matchesSearch && matchesDate
  })

  // Pagination logic
  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentApplications = filteredApplications.slice(startIndex, endIndex)

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [statusFilter, searchTerm, dateFilter, itemsPerPage])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Pending
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="outline" className="bg-blue-50 text-[#0087DB] border-[#0087DB]">
            Approved
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Rejected
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleExportAll = async () => {
    setExporting(true)
    try {
      const result = await getApplicationsForExport()

      if (result.success && result.data.length > 0) {
        downloadExcel(result.data, "all_applications.xlsx")
        toast({
          title: "Export Successful",
          description: `Exported ${result.data.length} applications`,
        })
      } else {
        toast({
          title: "Export Failed",
          description: result.error || "No applications to export",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Export error:", error)
      toast({
        title: "Export Failed",
        description: "An error occurred during export",
        variant: "destructive",
      })
    } finally {
      setExporting(false)
    }
  }

  const handleExportFiltered = async () => {
    setExporting(true)
    try {
      const result = await getApplicationsForExport(statusFilter === "all" ? undefined : statusFilter)

      if (result.success && result.data.length > 0) {
        // Filter the data based on search term and date if needed
        const dataToExport = result.data.filter(
          (app) =>
            app.applicant.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.applicant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.course.name.toLowerCase().includes(searchTerm.toLowerCase()),
        )

        if (dataToExport.length === 0) {
          toast({
            title: "Export Failed",
            description: "No applications match your filter criteria",
            variant: "destructive",
          })
          return
        }

        downloadExcel(dataToExport, `filtered_applications_${statusFilter}.xlsx`)
        toast({
          title: "Export Successful",
          description: `Exported ${dataToExport.length} filtered applications`,
        })
      } else {
        toast({
          title: "Export Failed",
          description: result.error || "No applications to export",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Export error:", error)
      toast({
        title: "Export Failed",
        description: "An error occurred during export",
        variant: "destructive",
      })
    } finally {
      setExporting(false)
    }
  }

  const clearDateFilter = () => {
    setDateFilter({})
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">Applications</h2>
          <p className="text-gray-500">Manage application submissions</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Input
            placeholder="Search applications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-[250px]"
          />

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full sm:w-[200px] justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                {dateFilter.from ? (
                  dateFilter.to ? (
                    <>
                      {format(dateFilter.from, "LLL dd, y")} - {format(dateFilter.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateFilter.from, "LLL dd, y")
                  )
                ) : (
                  <span>Filter by date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                initialFocus
                mode="range"
                defaultMonth={dateFilter.from}
                selected={{
                  from: dateFilter.from,
                  to: dateFilter.to,
                }}
                onSelect={(range) => setDateFilter({ from: range?.from, to: range?.to })}
                numberOfMonths={2}
              />
              <div className="p-3 border-t">
                <Button variant="outline" size="sm" onClick={clearDateFilter} className="w-full">
                  Clear Date Filter
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={exporting}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                {exporting ? "Exporting..." : "Export"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportAll}>
                <Download className="mr-2 h-4 w-4" />
                Export All Applications
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportFiltered}>
                <Filter className="mr-2 h-4 w-4" />
                Export Filtered Applications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu> */}
        </div>
      </div>

      {/* Results count and pagination controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="text-sm text-gray-600">
          Showing {startIndex + 1}-{Math.min(endIndex, filteredApplications.length)} of{" "}
          {filteredApplications.length} applications
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Show:</span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => setItemsPerPage(Number(value))}
            >
              <SelectTrigger className="w-[80px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#0087DB] border-r-transparent"></div>
              <p className="mt-2 text-gray-500">Loading applications...</p>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No applications found</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Pathway</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentApplications.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{application.applicant.full_name}</p>
                          <p className="text-sm text-gray-500">{application.applicant.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{application.course.name}</TableCell>
                      <TableCell className="capitalize">{application.pathway}</TableCell>
                      <TableCell>{formatDate(application.submitted_at)}</TableCell>
                      <TableCell>{getStatusBadge(application.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/applications/${application.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t">
                  <div className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}