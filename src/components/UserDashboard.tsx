"use client"

import { useEffect, useState } from "react"
import { Cloud, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sidebar } from "./UserSidebar"
import { Navbar } from "./Navbar"

interface DashboardData {
  stats: {
    totalHours: number
    coursesCompleted: number
    totalCourses: number
    coursesInProgress: number
  }
  homework: Array<{
    id: string
    title: string
    type: string
    content: string
    course: {
      title: string
    }
    createdAt: string
  }>
  enrolledCourses: Array<{
    course: {
      title: string
      instructor: {
        user: {
          name: string
        }
      }
    }
    progress: number
    completedAt: string | null
  }>
  upcomingConsultations: Array<{
    scheduledAt: string
    instructor: {
      user: {
        name: string
        email: string
      }
    }
  }>
}

export default function DashboardPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch("/api/user")
        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data")
        }
        const data: DashboardData = await response.json()
        setDashboardData(data)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      }
    }

    fetchDashboardData()
  }, [])

  if (!dashboardData) {
    return (
      <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <div className="w-64 border-r bg-white p-4">
        <Sidebar/>
      </div>

      <div className="flex-1">
        {/* Header */}
        <header className="border-b bg-white p-4">
          <Navbar/>
        </header>

        <main className="p-6 mt-6">
          {/* Stats Section */}
          <div className="mb-8 grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="text-sm text-gray-500">Total hrs spent learning</div>
                <div className="mt-2 text-2xl font-semibold text-green-600">{dashboardData.stats.totalHours} hrs</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-sm text-gray-500">Courses Completed</div>
                <div className="mt-2 text-2xl font-semibold text-green-600">
                  {dashboardData.stats.coursesCompleted} out of {dashboardData.stats.totalCourses}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-sm text-gray-500">Courses in Progress</div>
                <div className="mt-2 text-2xl font-semibold text-green-600">{dashboardData.stats.coursesInProgress}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              {/* Homework Section */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>My Homework</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Course Name</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Time Left</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dashboardData.homework.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.course.title}</TableCell>
                          <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            {Math.ceil((new Date(item.createdAt).getTime() - new Date().getTime()) / (1000 * 3600 * 24))} days
                          </TableCell>
                          <TableCell>
                            <Badge variant={item.type === "PDF" ? "default" : "outline"} className="bg-green-100 text-green-800">
                              {item.type}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Courses Section */}
              <Card>
                <CardHeader>
                  <CardTitle>My Courses</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Course Name</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dashboardData.enrolledCourses.map((course, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{course.course.title}</TableCell>
                          <TableCell>{course.progress}%</TableCell>
                          <TableCell>
                            <Badge
                              variant={course.completedAt ? "outline" : "default"}
                              className={course.completedAt ? "bg-green-100 text-green-800" : ""}
                            >
                              {course.completedAt ? "Completed" : "Ongoing"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600 hover:bg-green-50 hover:text-green-700"
                            >
                              {course.completedAt ? "Review" : "Continue"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {/* Calendar Widget */}
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <CalendarComponent
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border"
                  />
                </CardContent>
              </Card>

              {/* Upcoming Lessons */}
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Lessons</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboardData.upcomingConsultations.map((consultation, index) => (
                      <div key={index} className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                          <div className="font-medium">{consultation.instructor.user.name}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(consultation.scheduledAt).toLocaleString()}
                          </div>
                        </div>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          Join
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Weather Updates */}
              <Card>
                <CardHeader>
                  <CardTitle>Weather Updates</CardTitle>
                  <div className="text-sm text-gray-500">Current conditions and forecast</div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-500">☀️</span>
                        <span>Sunny</span>
                      </div>
                      <span>72°F</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>🌡️</span>
                        <span>High/Low</span>
                      </div>
                      <span>75°F / 65°F</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Cloud className="h-5 w-5" />
                        <span>Humidity</span>
                      </div>
                      <span>45%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>🌧️</span>
                        <span>Precipitation</span>
                      </div>
                      <span>20%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}