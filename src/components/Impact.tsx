import Image from 'next/image'
import impactimage from '@/assets/Impact.svg'

const impactStats = [
  { label: 'Happy Farmers', value: '90%' },
  { label: 'Satisfied Farmers', value: '85%' },
  { label: 'Benefited Farmers', value: '70%' },
  { label: 'Informed Farmers', value: '75%' },
]

export default function Impact() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <Image 
              src={impactimage} 
              alt="Farmers group" 
              width={600} 
              height={400} 
              className="rounded-lg object-cover" // Ensures the image covers its container properly
            />
          </div>
          <div className="md:w-1/2">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">Our Impact on Farmers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {impactStats.map((stat, index) => (
                <div key={index} className="text-center">
                  <p className="text-3xl md:text-4xl font-bold text-green-500 mb-2">{stat.value}</p>
                  <p className="text-base md:text-lg text-gray-600">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
