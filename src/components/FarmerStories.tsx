"use client"

import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import farmerstories from '@/assets/FarmerStories.svg'

const stories = [
  {
    name: "John Smith",
    location: "Iowa, USA",
    story: "Using the crop health tracker, I was able to identify a pest issue early and save 40% of my corn yield.",
    improvement: "40% yield increase",
    benefits: ["Pest Management", "Data-Driven Farming"],
    image: farmerstories
  },
  {
    name: "Jane Doe",
    location: "California, USA",
    story: "With the new irrigation system, I&apos;ve increased my crop yield by 30%!",
    improvement: "30% yield increase",
    benefits: ["Water Conservation", "Cost Savings"],
    image: farmerstories
  },
  {
    name: "Mike Johnson",
    location: "Texas, USA",
    story: "Thanks to the weather tracking app, I was able to plan my harvest perfectly.",
    improvement: "Improved harvest timing",
    benefits: ["Timely Harvest", "Higher Quality Produce"],
    image: farmerstories
  }
];

export default function FarmerStories() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const handleNext = () => {
    setIsVisible(false);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % stories.length);
      setIsVisible(true);
    }, 300); // Match with transition duration
  };

  const handlePrev = () => {
    setIsVisible(false);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex - 1 + stories.length) % stories.length);
      setIsVisible(true);
    }, 300); // Match with transition duration
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-12 text-center">Farmer Success Stories</h2>
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <div className={`flex flex-col md:flex-row items-center transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <Image
              src={stories[currentIndex].image}
              alt={stories[currentIndex].name}
              width={120}
              height={120}
              className="rounded-full mb-6 md:mb-0 md:mr-8"
              sizes="(max-width: 768px) 80px, 120px" // Responsive image size
            />
            <div>
              <h3 className="text-2xl font-semibold mb-2">{stories[currentIndex].name}</h3>
              <p className="text-gray-600 mb-4">{stories[currentIndex].location}</p>
              <p className="text-lg mb-6">"{stories[currentIndex].story}"</p>
              <div className="flex flex-col md:flex-row justify-between">
                <div className="mb-4 md:mb-0">
                  <h4 className="font-semibold">Improvement Achieved</h4>
                  <p className="text-green-500 font-bold">{stories[currentIndex].improvement}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Key Benefits</h4>
                  <ul className="list-disc list-inside text-gray-600">
                    {stories[currentIndex].benefits.map((benefit, index) => (
                      <li key={index}>{benefit}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-center mt-8">
          <button className="mr-4" onClick={handlePrev}>
            <ChevronLeft className="w-6 h-6 text-green-500" />
          </button>
          <div className="flex space-x-2">
            {stories.map((_, index) => (
              <div key={index} className={`w-2 h-2 rounded-full ${index === currentIndex ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            ))}
          </div>
          <button className="ml-4" onClick={handleNext}>
            <ChevronRight className="w-6 h-6 text-green-500" />
          </button>
        </div>
      </div>
    </section>
  );
}
