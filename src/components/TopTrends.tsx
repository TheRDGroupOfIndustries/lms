"use client"

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Star } from 'lucide-react'
import toptrendmain from '@/assets/TopTrend_main.svg';
import { toast } from '@/hooks/use-toast';

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

export default function TopTrends() {
  const [imgError, setImgError] = useState(false);
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

  const CourseCard = ({ course }: { course: Course }) => (
    <div className="flex-shrink-0 bg-white rounded-lg shadow-md hover:shadow-lg transform transition-transform hover:scale-105 overflow-hidden" style={{ width: '290px' }}>
      <div className="relative aspect-video">
        {course.thumbnailUrl && !imgError ? (
          <Image
            src={course.thumbnailUrl}
            alt={course.title}
            layout="fill"
            objectFit="cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <span className="text-gray-400">No image available</span>
          </div>
        )}
      </div>
      <div className="p-4 sm:p-6">
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
      </div>
    </div>
  );

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-between mb-8 text-center md:text-left">
          <h2 className="text-3xl font-bold mb-8 md:w-1/2">
            Top Trends Shaping the Future of Agriculture
          </h2>
          <div className="md:w-[65%] flex justify-center md:justify-end">
            <Image
              src={toptrendmain}
              alt="Mobile app preview"
              width={600}
              height={400}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="rounded-lg w-full h-auto"
              priority={true}
            />
          </div>
        </div>

        <div className="flex flex-col mb-12 text-center md:text-left">
          <h3 className="text-2xl font-semibold mb-6">Trending Now</h3>
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex space-x-4 py-4">
              {courses.slice(0,4).map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </div>
        </div>

        <div className="text-center">
          <Dialog>
            <DialogTrigger asChild>
              <button className="bg-green-500 shadow-md hover:shadow-lg text-white px-8 py-3 rounded-full hover:bg-green-600 transition">
                See all
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl h-full">
              <ScrollArea className="h-full w-full pr-4">
                <div className="grid grid-cols-3 gap-6">
                  {courses.map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </section>
  );
}

