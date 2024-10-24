import Link from 'next/link';
import { Facebook, Linkedin, Youtube, Instagram } from 'lucide-react';

const footerLinks = [
  { title: 'About', links: ['About Us', 'Careers', 'Press', 'Blog'] },
  { title: 'Help', links: ['Contact Us', 'FAQs', 'Shipping', 'Returns'] },
  { title: 'Terms', links: ['Terms of Service', 'Privacy Policy', 'Refund Policy', 'App Privacy Policy'] },
];

export default function Footer() {
  return (
    <footer className="bg-green-600 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {footerLinks.map((section, index) => (
            <div key={index} className="flex flex-col">
              <h3 className="font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link href="#" className="hover:underline">{link}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="flex flex-col">
            <h3 className="font-semibold mb-4">Newsletter</h3>
            <form className="flex flex-col md:flex-row">
              <input
                type="email"
                placeholder="Your email"
                className="px-4 py-2 w-full rounded-l-full focus:outline-none text-gray-800 mb-2 md:mb-0 md:mr-2"
              />
              <button
                type="submit"
                className="bg-yellow-500 text-green-800 px-4 py-2 rounded-r-full hover:bg-yellow-600 transition"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center border-t border-green-500 pt-8">
          <p className="text-center md:text-left">&copy; 2024 Reverent Pvt. Ltd. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link href="#" className="hover:text-yellow-500 transition">
              <Facebook />
            </Link>
            <Link href="#" className="hover:text-yellow-500 transition">
              <Linkedin />
            </Link>
            <Link href="#" className="hover:text-yellow-500 transition">
              <Youtube />
            </Link>
            <Link href="#" className="hover:text-yellow-500 transition">
              <Instagram />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
