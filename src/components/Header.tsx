"use client"

import Link from 'next/link';
import { ShoppingCart, Bell } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
        <Link href="/" className="text-2xl font-bold text-green-600">
          Reverent
        </Link>
        <div className="flex flex-col sm:flex-row items-center w-full sm:w-auto space-y-4 sm:space-y-0 sm:space-x-4">
          <input
            type="text"
            placeholder="Search"
            className="border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 w-full sm:w-64"
          />
          <div className="flex items-center space-x-4">
            <ShoppingCart className="text-gray-600 block sm:hidden lg:block" />
            <Bell className="text-gray-600 block sm:hidden lg:block" />
          </div>
          <button className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 transition w-full sm:w-auto">
            Log in
          </button>
          <button className="border border-green-500 text-green-500 px-4 py-2 rounded-full hover:bg-green-50 transition w-full sm:w-auto">
            Sign up
          </button>
        </div>
      </div>
    </header>
  );
}
