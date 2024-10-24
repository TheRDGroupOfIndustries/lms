"use client"

import Image from 'next/image';
import toptrendmain from '@/assets/TopTrend_main.svg';
import trend1 from '@/assets/Trend1.svg';
import trend2 from '@/assets/Trend2.svg';
import trend3 from '@/assets/Trend3.svg';

const trendingCourses = [
  {
    title: 'Sustainable Farming Practices',
    image: trend1,
    price: '₹100',
    rating: 4.5,
    students: 32667,
    instructor: 'Dr. Ravi Patel',
    duration: '8 weeks',
  },
  {
    title: 'Sustainable Farming Practices',
    image: trend2,
    price: '₹100',
    rating: 4.5,
    students: 32667,
    instructor: 'Dr. Ravi Patel',
    duration: '8 weeks',
  },
  {
    title: 'Sustainable Farming Practices',
    image: trend3,
    price: '₹100',
    rating: 4.5,
    students: 32667,
    instructor: 'Dr. Ravi Patel',
    duration: '8 weeks',
  },
];

export default function TopTrends() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Row for the title and image */}
        <div className="flex flex-col items-center justify-between mb-8 text-center md:text-left">
          <h2 className="text-3xl font-bold mb-8 md:w-1/2">
            Top Trends Shaping the Future of Agriculture
          </h2>
          <div className="md:w-[65%] flex justify-center md:justify-end">
            {/* Optimize Image Loading */}
            <Image
              src={toptrendmain}
              alt="Mobile app preview"
              width={600}
              height={400}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="rounded-lg w-full h-auto" // Made responsive
              priority={true} // Load this image first as it's important for above-the-fold content
            />
          </div>
        </div>

        {/* Row for "Trending Now" and the courses */}
        <div className="flex flex-col mb-12 text-center md:text-left">
          <h3 className="text-2xl font-semibold mb-6">Trending Now</h3>
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex space-x-4">
              {trendingCourses.map((course, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  {/* Optimize Image Loading */}
                  <Image
                    src={course.image}
                    alt={course.title}
                    width={200}
                    height={100}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    className="rounded-lg w-full h-auto mb-2"
                    placeholder="blur" // Add blur placeholder for better UX
                    blurDataURL="data:image/svg+xml;base64,..." // Low-res data URL for placeholder
                    loading="lazy" // Ensure lazy loading for all other images
                  />
                  <div className="flex flex-col">
                    <h4 className="font-semibold mb-2 text-left">{course.title}</h4>
                    <div className="flex items-center mb-2 justify-between">
                      <span className="font-bold text-green-500">{course.price}</span>
                      <div>
                        <span className="text-yellow-500">
                          {"★".repeat(Math.floor(course.rating))}
                          {"☆".repeat(5 - Math.floor(course.rating))}
                        </span>
                        <span className='text-yellow-500'>({course.rating})</span>
                      </div>
                      <span className="text-gray-500 ml-2">({course.students.toLocaleString()})</span>
                    </div>
                    <span className='text-gray-500'>Instructor: {course.instructor}</span>
                    <span className='text-gray-500'>Duration: {course.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Centered "See all" button */}
        <div className="text-center">
          <button className="bg-green-500 shadow-md hover:shadow-lg text-white px-8 py-3 rounded-full hover:bg-green-600 transition">
            See all
          </button>
        </div>
      </div>
    </section>
  );
}
