"use client"

import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import learningfocus1 from '@/assets/LearningFocus1.svg';
import learningfocus2 from '@/assets/LearningFocus2.svg';
import learningfocus3 from '@/assets/LearningFocus3.svg';

const features = [
  {
    title: 'Practical, hands-on guidance',
    description: 'Get actionable training with real-world farming tips, videos, and tutorials—learn by doing, not just reading.',
    image: learningfocus1,
  },
  {
    title: 'Track your progress',
    description: 'Monitor your learning journey with simple progress reports and personalized farming recommendations based on your goals.',
    image: learningfocus2,
  },
  {
    title: 'Prepare for success in agriculture',
    description: 'Access modules that prepare you for certifications and best practices to meet industry standards and improve your farm.',
    image: learningfocus3,
  },
];

export default function LearningFocus() {
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">
          Learning focused on your farm's success
        </h2>
        <p className="text-lg md:text-xl text-gray-600 mb-8 text-center max-w-3xl mx-auto">
          Easy-to-follow lessons designed to help you achieve better crop yields, efficient farming practices, and sustainable growth.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col items-start border border-[#1AA34A] bg-gray-50 rounded-lg p-4 md:p-6 hover:shadow-lg transition-transform transform hover:scale-105">
              <Image
                src={feature.image}
                alt={feature.title}
                width={400}
                height={250}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-base mb-4">{feature.description}</p>
              <button className="text-green-500 font-semibold flex items-center hover:underline">
                Know more <ArrowRight className="ml-2 w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
