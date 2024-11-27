"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

interface Course {
    id: string
    title: string
    students: number
}

interface PaginationInfo {
    currentPage: number
    totalPages: number
    totalItems: number
    hasMore: boolean
}

export default function CoursesPage() {
    const [courses, setCourses] = useState<Course[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [pagination, setPagination] = useState<PaginationInfo | null>(null)

    useEffect(() => {
        fetchCourses()
    }, [])

    async function fetchCourses(page = 1, limit = 10) {
        setLoading(true)
        setError(null)
        try {
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                sortBy: 'createdAt',
                sortOrder: 'desc'
            })
            const response = await fetch(`/api/instructor/courses?${queryParams}`)
            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to fetch courses')
            }
            const data = await response.json()
            setCourses(data.courses.map((course: { id: string; title: string; studentCount: number }) => ({
                id: course.id,
                title: course.title,
                students: course.studentCount
            })))
            setPagination(data.pagination)
        } catch (error) {
            console.error('Error fetching courses:', error)
            setError(error instanceof Error ? error.message : 'An unknown error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col gap-8 p-8">
            <div className="flex flex-col gap-[13px]">
                <h1 className="text-2xl font-bold tracking-tight">Your Courses</h1>
                <p className="text-muted-foreground">
                    Manage your courses and consultations
                </p>
            </div>
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            )}
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-[#B2B2B2]">Your Courses</TableHead>
                        <TableHead className="text-[#B2B2B2]">Students</TableHead>
                        <TableHead className="text-[#B2B2B2]">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={3} className="text-center">
                                Loading...
                            </TableCell>
                        </TableRow>
                    ) : courses.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={3} className="text-center">
                                No courses found
                            </TableCell>
                        </TableRow>
                    ) : (
                        courses.map((course) => (
                            <TableRow key={course.id}>
                                <TableCell>{course.title}</TableCell>
                                <TableCell>{course.students}</TableCell>
                                <TableCell>
                                    <Button variant="outline" size="sm">
                                        Manage
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
            {pagination && (
                <div className="flex justify-between items-center mt-4">
                    <Button 
                        onClick={() => fetchCourses(pagination.currentPage - 1)}
                        disabled={pagination.currentPage === 1}
                    >
                        Previous
                    </Button>
                    <span>Page {pagination.currentPage} of {pagination.totalPages}</span>
                    <Button 
                        onClick={() => fetchCourses(pagination.currentPage + 1)}
                        disabled={!pagination.hasMore}
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    )
}