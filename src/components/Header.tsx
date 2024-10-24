"use client";

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { FaGlobe } from 'react-icons/fa';
import { FiMenu, FiSearch } from 'react-icons/fi';
import { useState } from 'react';
import { IoClose } from 'react-icons/io5';

export default function Header() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-2 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-green-600">
          Reverent
        </Link>

        {/* Hamburger Menu for small screens */}
        <button
          className="block lg:hidden text-gray-600 focus:outline-none"
          onClick={toggleSidebar}
        >
          <FiMenu className="w-6 h-6" />
        </button>

        {/* Sidebar for mobile view */}
        <div
          className={`fixed inset-0 bg-gray-800 bg-opacity-75 z-50 flex justify-end transform ${
            isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
          } transition-transform lg:hidden`}
        >
          <div className="w-64 bg-white h-full shadow-lg flex flex-col p-6">
            {/* Close Sidebar Button */}
            <button className="self-end text-gray-600" onClick={toggleSidebar}>
              <IoClose className="w-6 h-6" />
            </button>

            {/* Sidebar Content */}
            <div className="mt-8">
              {/* Search Bar */}
              <div className="relative mb-6">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full border border-gray-300 rounded-full px-10 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className='flex gap-4 items-center'>
                {/* Shopping Cart Icon */}
                <ShoppingCart className="text-[#1AA34A] mb-4" />

                {/* Language Icon */}
                <FaGlobe className="text-[#1AA34A] mb-4" />
              </div>
              {/* Log in Button */}
              <button className="bg-green-500 shadow-md hover:shadow-lg text-white px-4 py-2 rounded-full hover:bg-green-600 transition w-full mb-4">
                Log in
              </button>

              {/* Sign up Button */}
              <button className="border shadow-md hover:shadow-lg border-green-500 text-green-500 px-4 py-2 rounded-full hover:bg-green-50 transition w-full">
                Sign up
              </button>
            </div>
          </div>
        </div>

        {/* Icons and buttons visible on larger screens */}
        <div className="hidden lg:flex items-center space-x-4">
          {/* Search Bar */}
          <div className="flex-grow mx-4 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search"
              className="w-[500px] lg:mr-28 border border-gray-300 rounded-full px-10 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Shopping Cart Icon */}
          <ShoppingCart className="text-[#1AA34A]" />

          {/* Language Icon */}
          <FaGlobe className="text-[#1AA34A]" />

          {/* Log in Button */}
          <button className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 transition">
            Log in
          </button>

          {/* Sign up Button */}
          <button className="border border-green-500 text-green-500 px-4 py-2 rounded-full hover:bg-green-50 transition">
            Sign up
          </button>
        </div>
      </div>
    </header>
  );
}
