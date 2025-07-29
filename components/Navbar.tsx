// components/Navbar.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { 
  BellIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="bg-white shadow-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="h-8 w-8 flex items-center justify-center rounded-full bg-green-100">
                <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
              </div>
              <span className="ml-2 text-lg font-bold text-gray-900">OnlyFarmers</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/listings"
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
              >
                Browse
              </Link>
              {user?.role === "farmer" && (
                <Link
                  href="/my-listings"
                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                >
                  My Listings
                </Link>
              )}
              <Link
                href="/create-listing"
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
              >
                Create Listing
              </Link>
              <Link
                href="/chat"
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
              >
                AI Assistant
              </Link>
            </div>
          </div>

          {/* User Menu */}
          {user && (
            <div className="hidden md:block">
              <div className="ml-4 flex items-center md:ml-6 space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                  </div>
                  <UserCircleIcon className="h-7 w-7 text-gray-600" />
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center px-3 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4 mr-1" />
                  Logout
                </button>
              </div>
            </div>
          )}

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
            >
              {mobileMenuOpen ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white">
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 block px-3 py-2 rounded-md text-sm font-medium"
            >
              Dashboard
            </Link>
            <Link
              href="/listings"
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 block px-3 py-2 rounded-md text-sm font-medium"
            >
              Browse
            </Link>
            {user?.role === "farmer" && (
              <Link
                href="/my-listings"
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 block px-3 py-2 rounded-md text-sm font-medium"
              >
                My Listings
              </Link>
            )}
            <Link
              href="/create-listing"
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 block px-3 py-2 rounded-md text-sm font-medium"
            >
              Create Listing
            </Link>
            <Link
              href="/chat"
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 block px-3 py-2 rounded-md text-sm font-medium"
            >
              AI Assistant
            </Link>
          </div>
          {user && (
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-5">
                <UserCircleIcon className="h-8 w-8 text-gray-600" />
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-800">{user?.name}</div>
                  <div className="text-xs font-medium text-gray-500 capitalize">{user?.role}</div>
                </div>
              </div>
              <div className="mt-3 px-2 space-y-1">
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-3 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
