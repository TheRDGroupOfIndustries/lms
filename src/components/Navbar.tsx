"use client"

import { useState, useEffect } from 'react';
import { Search, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BsTranslate } from "react-icons/bs";
import { useRouter } from 'next/navigation';

export function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleSignOut = async () => {
    try {
      // Call the backend to clear the cookie
      const response = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include', // This is important for including cookies in the request
      });

      if (response.ok) {
        // Clear the token from localStorage
        localStorage.removeItem('token');
        setIsLoggedIn(false);
        router.push('/signin');
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-[120px]">
            <Link href="/" className="text-green-600 text-xl font-bold">
              Reverent
            </Link>
            <div className="ml-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-[500px] pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-green-500"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="icon">
              <ShoppingCart className="h-5 w-5 text-green-500" />
            </Button>
            <Button variant="ghost" size="icon">
              <BsTranslate className="h-5 w-5 text-green-500" />
            </Button>
            {isLoggedIn ? (
              <Button
                onClick={handleSignOut}
                variant="outline"
                className="ml-4 border border-green-500 hover:bg-green-500 hover:text-white px-4 py-2 rounded-full bg-white text-green-500 transition"
              >
                Sign Out
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button variant="outline" asChild className='border border-green-500 hover:bg-green-500 hover:text-white px-4 py-2 rounded-full bg-white text-green-500 transition'>
                  <Link href="/signin">Log In</Link>
                </Button>
                <Button variant="outline" asChild className='border border-green-500 hover:bg-green-500 hover:text-white px-4 py-2 rounded-full bg-white text-green-500 transition'>
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}