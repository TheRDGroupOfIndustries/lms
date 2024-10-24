"use client"

import Image from 'next/image';
import toptrendmain from '@/assets/TopTrend_main.svg';
import trend1 from '@/assets/Trend1.svg';
import trend2 from '@/assets/Trend2.svg';
import trend3 from '@/assets/Trend3.svg';

const trendingCourses = [
  { title: 'Sustainable Farming Practices', image: trend1, price: '₹100', rating: 4.5, students: 1000 },
  { title: 'Organic Pest Control Methods', image: trend2, price: '₹100', rating: 4.8, students: 800 },
  { title: 'Advanced Crop Rotation Techniques', image: trend3, price: '₹100', rating: 4.7, students: 1200 },
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
          <div className="md:w-1/2 flex justify-center md:justify-end">
            <Image
              src={toptrendmain}
              alt="Mobile app preview"
              width={600}
              height={400}
              className="rounded-lg w-full h-auto" // Made responsive
            />
          </div>
        </div>

        {/* Row for "Trending Now" and the courses */}
        <div className="flex flex-col mb-12 text-center md:text-left">
          <h3 className="text-2xl font-semibold mb-6">Trending Now</h3>
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex space-x-4">
              {trendingCourses.map((course, index) => (
                <div key={index} className="flex-shrink-0 bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <Image
                    src={course.image}
                    alt={course.title}
                    width={200} // Increased size for better visibility
                    height={100} // Adjust height for aspect ratio
                    className="rounded-lg w-full h-auto mb-2" // Made responsive
                  />
                  <div className="flex flex-col">
                    <h4 className="font-semibold mb-2 text-left">{course.title}</h4>
                    <div className="flex items-center mb-2">
                      <span className="text-yellow-500 mr-1">★</span>
                      <span>{course.rating}</span>
                      <span className="text-gray-500 ml-2">({course.students})</span>
                    </div>
                    <p className="font-bold text-green-500">{course.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Centered "See all" button */}
        <div className="text-center">
          <button className="bg-green-500 text-white px-8 py-3 rounded-full hover:bg-green-600 transition">
            See all
          </button>
        </div>
      </div>
    </section>
  );
}
