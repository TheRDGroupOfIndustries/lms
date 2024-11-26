"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Navbar } from "@/components/Navbar"

const faqs = [
  {
    question: "1. What is AI in agriculture?",
    answer:
      "AI in agriculture refers to the use of advanced technologies such as machine learning, robotics, and computer vision to improve farming practices. These systems improve crop yields, enable weather prediction, optimize resource use, and more.",
  },
  {
    question: "2. Can AI help with pest control?",
    answer:
      "Yes, AI can help identify and monitor pest infestations using image recognition and predictive analytics, allowing for targeted and efficient pest control measures.",
  },
  {
    question: "4. How does AI help with weather predictions for farming?",
    answer:
      "AI analyzes historical weather data and current patterns to provide accurate forecasts, helping farmers make informed decisions about planting, irrigation, and harvesting.",
  },
  {
    question: "5. Is AI suitable for small-scale farmers?",
    answer:
      "Yes, there are many AI solutions specifically designed for small-scale farming operations, offering affordable and accessible tools for crop management and optimization.",
  },
]

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredFaqs = faqs.filter((faq) =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex min-h-screen bg-background">
      <div className="flex-1 mt-5">
        {/* Header */}
        <header className="border-b bg-white p-4">
          <Navbar/>
        </header>
        <div className="px-8 py-6">
          <div className="mb-6">
            <h1 className="text-xl font-semibold">Support Center</h1>
            <p className="text-sm text-muted-foreground">
              Quick access to FAQs, support, and tutorials
            </p>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Accordion
            type="single"
            collapsible
            className="mb-6 space-y-2 rounded-lg border bg-white p-2"
          >
            {filteredFaqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border-none"
              >
                <AccordionTrigger className="rounded-md px-4 py-2 hover:bg-gray-50 hover:no-underline [&[data-state=open]]:bg-gray-50">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-2 pt-1">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="rounded-lg border bg-white p-6 text-center">
            <h2 className="text-lg font-semibold">One-Click Support</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Get urgent assistance from our support team
            </p>
            <Button className="mt-4 bg-emerald-500 hover:bg-emerald-600">
              One-Click Support
            </Button>
            <p className="mt-2 text-xs text-rose-500">
              Click for urgent assistance
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}