"use client"

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Video, 
  Bell,
  Users,
  HelpCircle,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';

type MenuItem = {
  icon: React.ElementType;
  label: string;
  href: string;
  subItems?: { label: string; href: string }[]; // Add subItems as an optional property
};

const menuItems: MenuItem[] = [
  { 
    icon: LayoutDashboard, 
    label: 'Dashboard', 
    href: '/dashboard' 
  },
  {
    icon: Video,
    label: 'Upload Courses',
    href: '/courses/upload',
  },
  { 
    icon: Bell, 
    label: 'Notifications', 
    href: '/notifications' 
  },
  { 
    icon: Users, 
    label: 'Community', 
    href: '/community' 
  },
  { 
    icon: HelpCircle, 
    label: 'Support', 
    href: '/support' 
  }
];

export function Sidebar() {
  const pathname = usePathname();
  const [expandedMenu, setExpandedMenu] = useState<string | null>('Training');

  return (
    <div className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="py-4">
        {menuItems.map((item) => (
          <div key={item.label}>
            <Link
              href={item.href}
              className={`flex items-center px-4 py-2 mx-2 rounded-lg ${
                pathname === item.href
                  ? 'bg-green-50 text-green-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => {
                if (item.subItems) {
                  setExpandedMenu(expandedMenu === item.label ? null : item.label);
                }
              }}
            >
              <item.icon className="h-5 w-5 mr-3" />
              <span>{item.label}</span>
              {item.subItems && (
                <span className="ml-auto">
                  {expandedMenu === item.label ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </span>
              )}
            </Link>
            {item.subItems && expandedMenu === item.label && (
              <div className="ml-12 mt-2 space-y-1">
                {item.subItems.map((subItem) => (
                  <Link
                    key={subItem.label}
                    href={subItem.href}
                    className={`block py-2 px-4 rounded-lg ${
                      pathname === subItem.href
                        ? 'text-green-600 bg-green-50'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {subItem.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="absolute bottom-8 left-4 right-4 m-4">
        <div className="bg-green-500 rounded-lg p-4 text-white">
          <h3 className="font-semibold mb-2">
            Boost your farming success with live classes!!
          </h3>
          <p className="text-sm mb-4">
            Sign up now for live classes and take your skills to the next level
          </p>
          <Button className="w-full bg-white text-black">Join Now</Button>
        </div>
      </div>
    </div>
  );
}