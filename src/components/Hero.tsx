import Image from 'next/image'
import heroimage from '@/assets/Hero.svg'

export default function Hero() {
  return (
    <section className="bg-white pt-10 md:pt-20">
      <div className="container mx-auto px-4">
        {/* Center content vertically and horizontally */}
        <div className="flex flex-col items-center justify-center text-center">
          {/* Text and Button Section */}
          <div className="w-full md:w-3/4 lg:w-1/2 mb-10">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
              Empowering Farmers with <span className="text-yellow-500">Knowledge</span>
            </h1>
            <p className="text-lg sm:text-xl mb-8">
              Simple, Easy-to-Use Learning for Better Farming
            </p>
            <button className="bg-green-500 text-white px-6 py-3 rounded-full text-lg hover:bg-green-600 transition">
              Get Started
            </button>
          </div>

          {/* Image Section */}
          <div className="w-full">
            <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden">
              <Image
                src={heroimage}
                alt={"heroimage"}
                width={800}
                height={500}
                className="w-full h-auto rounded-lg shadow-lg border border-gray-200"
              />
            </div>
          </div>
        </div>
        <div className='mx-6 mb-10'>
          <p className='text-[40px]'>All the farming knowledge you need in one place—</p>
          <p className='text-[24px]'>learn, grow, and succeed with our easy-to-use platform designed for farmers.</p>
        </div>
      </div>
    </section>
  )
}
