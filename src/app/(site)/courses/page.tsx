"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Star } from 'lucide-react'
import Image from "next/image"
import { Navbar } from '@/components/Navbar'
import { Sidebar } from '@/components/UserSidebar'
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "@/hooks/use-toast"

interface Course {
  id: string
  title: string
  price: number
  averageRating: number
  totalRatings: number
  thumbnailUrl: string
  isLocked?: boolean
  instructor: {
    user: {
      name: string
    }
  }
}

export default function Component() {
  const [language, setLanguage] = useState<"ENGLISH" | "HINDI">("ENGLISH")
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('/api/courses');
        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }
        const data = await response.json();
        setCourses(data);
      } catch (err) {
        setError('An error occurred while fetching courses');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const rateCourse = async (courseId: string, rating: number) => {
    try {
      const response = await fetch('/api/courses/rate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ courseId, rating }),
      });

      if (!response.ok) {
        throw new Error('Failed to rate course');
      }

      const updatedCourse = await response.json();
      setCourses(courses.map(course => 
        course.id === updatedCourse.id ? updatedCourse : course
      ));

      toast({
        title: "Course Rated",
        description: "Thank you for rating this course!",
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to rate the course. Please try again.",
        variant: "destructive",
      });
    }
  };

  const CourseCard = ({ course }: { course: Course }) => {
    const [imgError, setImgError] = useState(false);

    return (
      <Card className="overflow-hidden rounded-lg shadow-md">
        <div className="relative aspect-video">
          {course.thumbnailUrl && !imgError ? (
            <Image
              src={course.thumbnailUrl}
              alt={course.title || "Course thumbnail"}
              height={400}
              width={600}
              className="object-cover w-full h-full rounded-t-lg"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded-t-lg">
              <span className="text-gray-400">No image available</span>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg">{course.title}</h3>
          <div className="flex items-center mt-2">
            <span className="text-green-600 font-bold">₹ {course.price?.toFixed(2) || "0.00"}</span>
            <div className="flex items-center ml-4">
              <span className="text-yellow-500 font-semibold">{course.averageRating?.toFixed(1) || "N/A"}</span>
              <div className="flex ml-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 cursor-pointer ${
                      i < Math.floor(course.averageRating || 0)
                        ? "fill-current text-yellow-500"
                        : "fill-current text-gray-300"
                    }`}
                    onClick={() => rateCourse(course.id, i + 1)}
                  />
                ))}
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2 text-[#858585]">Instructor: {course.instructor.user.name}</p>
          <p className="text-sm text-muted-foreground mt-1">({course.totalRatings.toLocaleString()} ratings)</p>
        </CardContent>
      </Card>
    );
  };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    if (error) {
        return <div className="text-center py-10 text-red-500">{error}</div>
    }

    return (
        <div className="flex min-h-screen flex-col">
            <div className="w-64 border-r bg-white p-4">
                <Sidebar />
            </div>
            <div className="container flex-1 items-start md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10">
                <header className="border-b bg-white p-4">
                    <Navbar />
                </header>
                <div className="flex w-full flex-col mt-20">
                    <div className="items-center">
                        <Select value={language} onValueChange={(value: "ENGLISH" | "HINDI") => setLanguage(value)}>
                            <SelectTrigger className="w-32">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ENGLISH">English</SelectItem>
                                <SelectItem value="HINDI">Hindi</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {['Recommended courses', 'Master the Future of Farming', 'You might like these courses'].map((sectionTitle) => (
                        <section key={sectionTitle} className="mt-8">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold">{sectionTitle}</h2>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="link">See all</Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-4xl h-full scrollbar-hide">
                                        <ScrollArea className="h-full w-full pr-4">
                                            <div className="grid grid-cols-3 gap-4">
                                                {courses.map((course) => (
                                                    <CourseCard key={course.id} course={course} />
                                                ))}
                                            </div>
                                        </ScrollArea>
                                    </DialogContent>
                                </Dialog>
                            </div>
                            <div className="mt-4 flex space-x-4 overflow-x-auto scrollbar-hide">
                                {courses.slice(0, 4).map((course) => (
                                    <CourseCard key={course.id} course={course} />
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            </div>
        </div>
    );
}

