"use client"

import Header from '@/components/Header'
import Hero from '@/components/Hero'
import Categories from '@/components/Categories'
import LearningFocus from '@/components/LearningFocus'
import FarmerStories from '@/components/FarmerStories'
import TopTrends from '@/components/TopTrends'
import Impact from '@/components/Impact'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 overflow-hidden">
      <Header />
      <main>
        <Hero />
        <Categories />
        <LearningFocus />
        <FarmerStories />
        <TopTrends />
        <Impact />
      </main>
      <Footer />
    </div>
  )
}