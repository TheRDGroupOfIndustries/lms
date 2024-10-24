import Image from 'next/image';
import category1 from '@/assets/Category1.svg';
import category2 from '@/assets/Category2.svg';
import category3 from '@/assets/Category3.svg';

const categories = [
  { name: 'Sustainable Agriculture', image: category1 },
  { name: 'Soil Health', image: category2 },
  { name: 'Water Management', image: category3 },
  { name: 'Soil Regeneration', image: category1 },
  { name: 'Fertilizers', image: category2 },
  { name: 'Fertilizers', image: category3 },
];

export default function Categories() {
  return (
    <section className="pb-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-left ml-8">Categories</h2>
        
        {/* Button group (Horizontal scrollable) */}
        <div className="overflow-x-auto whitespace-nowrap flex gap-4 py-4 scrollbar-hide">
          {categories.map((category, index) => (
            <button 
              key={index} 
              className="inline-block px-4 py-2 text-sm sm:text-base bg-white rounded-full border border-green-500 text-green-500 hover:bg-green-50 transition"
            >
              {category.name}
            </button>
          ))}
        </div>
        
        {/* Grid for cards with horizontal scroll */}
        <div className="overflow-x-auto whitespace-nowrap flex gap-6 mt-8 sm:mt-12 scrollbar-hide">
          {categories.map((category, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md w-64 sm:w-72"> {/* Adjusted card width */}
              <Image 
                src={category.image} 
                alt={category.name} 
                width={400} 
                height={250} 
                className="w-full h-48 object-cover"
              />
              <div className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-semibold mb-2">{category.name}</h3>
                <div className="flex items-center mb-4">
                  <span className="text-yellow-500">★★★★☆</span>
                  <span className="text-gray-600 ml-2">(4.5/5)</span>
                </div>
                <p className="text-gray-600 mb-4">Instructor: Dr. John Doe</p>
                <button className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 transition w-full sm:w-auto">Enroll Now</button>
              </div>
            </div>
          ))}
        </div>

        {/* Show all button */}
        <div className="text-center mt-8 sm:mt-12">
          <button className="border border-green-500 text-green-500 px-6 sm:px-8 py-2 sm:py-3 rounded-full hover:bg-green-50 transition">
            Show All Courses
          </button>
        </div>
      </div>
    </section>
  );
}
