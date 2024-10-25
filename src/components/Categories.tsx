"use client";

import Image from "next/image";
import category1 from "@/assets/Category1.svg";
import category2 from "@/assets/Category2.svg";
import category3 from "@/assets/Category3.svg";
import { useRef } from "react";

const categories = [
  { name: "Sustainable Agriculture", image: category1 },
  { name: "Soil Health", image: category2 },
  { name: "Water Management", image: category3 },
  { name: "Soil Regeneration", image: category1 },
  { name: "Fertilizers", image: category2 },
];

const courses = [
  {
    image: category1,
    title: "Sustainable Farming Practices",
    price: 100,
    rating: 4.5,
    reviews: 32667,
    instructor: "Dr. Ravi Patel",
    duration: "8 weeks",
    bestSeller: true,
  },
  {
    image: category2,
    title: "Sustainable Farming Practices",
    price: 100,
    rating: 4.5,
    reviews: 32667,
    instructor: "Dr. Ravi Patel",
    duration: "8 weeks",
    bestSeller: true,
  },
  {
    image: category3,
    title: "Sustainable Farming Practices",
    price: 100,
    rating: 4.5,
    reviews: 32667,
    instructor: "Dr. Ravi Patel",
    duration: "8 weeks",
    bestSeller: true,
  },
  {
    image: category1,
    title: "Sustainable Farming Practices",
    price: 100,
    rating: 4.5,
    reviews: 32667,
    instructor: "Dr. Ravi Patel",
    duration: "8 weeks",
    bestSeller: true,
  },
  {
    image: category2,
    title: "Sustainable Farming Practices",
    price: 100,
    rating: 4.5,
    reviews: 32667,
    instructor: "Dr. Ravi Patel",
    duration: "8 weeks",
    bestSeller: true,
  },
  // Add more course objects for other cards here
];

export default function Categories() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  const handleScrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  return (
    <section className="pb-12 bg-gray-50 mx-6">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-left">
          Categories
        </h2>

        {/* Button group (Horizontal scrollable with "See All" button on the right) */}
        <div className="flex items-center justify-between">
          <div className="overflow-x-auto whitespace-nowrap flex gap-4 py-4 scrollbar-hide ">
            {categories.map((category, index) => (
              <button
                key={index}
                className="inline-block shadow-md hover:shadow-lg px-4 py-2 text-sm sm:text-base bg-white rounded-full border border-green-500 text-green-500 hover:text-white hover:bg-[#1AA34A] transition"
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* "See All" button */}
          <div className="ml-4">
            <button className="text-green-500 text-sm sm:text-base font-semibold hover:underline flex items-center">
              See all <span className="ml-1">→</span>
            </button>
          </div>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Left Scroll Button */}
          <button
            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white shadow-lg rounded-full p-2 z-10"
            onClick={handleScrollLeft}
          >
            ◀
          </button>

          {/* Grid for cards with horizontal scroll */}
          <div
            ref={scrollRef}
            className="overflow-x-auto whitespace-nowrap flex gap-6 mt-8 sm:mt-12 scrollbar-hide overflow-hidden"
          >
            {courses.map((course, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md w-64 sm:w-96 inline-block transform transition-transform hover:scale-105"
              >
                <Image
                  src={course.image}
                  alt={course.title}
                  width={400}
                  height={250}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-semibold mb-2">
                    {course.title}
                  </h3>
                  <p className="text-green-600 font-bold mb-2">₹ {course.price}</p>
                  <div className="flex items-center mb-2">
                    <span className="text-yellow-500">
                      {"★".repeat(Math.floor(course.rating))}
                      {"☆".repeat(5 - Math.floor(course.rating))}
                    </span>
                    <span className="text-gray-600 ml-2">
                      ({course.reviews})
                    </span>
                  </div>
                  <p className="text-gray-600 mb-2">Instructor: {course.instructor}</p>
                  <p className="text-gray-600 mb-4">Duration: {course.duration}</p>
                  {course.bestSeller && (
                    <span className="inline-block bg-yellow-400 text-white px-2 py-1 text-xs rounded-full mb-4">
                      Bestseller
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Right Scroll Button */}
          <button
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white shadow-lg rounded-full p-2 z-10"
            onClick={handleScrollRight}
          >
            ▶
          </button>
        </div>

        {/* Show all button */}
        <div className="text-center mt-8 sm:mt-12">
          <button className="border border-green-500 text-green-500 px-6 sm:px-20 py-2 sm:py-3 rounded-full hover:bg-green-50 transition shadow-md hover:shadow-lg">
            Show All Courses
          </button>
        </div>
      </div>
    </section>
  );
}
