'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User, LogOut } from 'lucide-react'
import { SignedIn, SignedOut, UserButton, SignInButton } from '@clerk/nextjs'

export default function Navbar() {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const profileMenuRef = useRef(null)
  const pathname = usePathname()

  const toggleProfile = () => setIsProfileOpen(!isProfileOpen)

  // Close the dropdown if a click happens outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <nav className="bg-black text-gray-200 p-4">
      <div className="px-3 mx-auto flex justify-between items-center">
        <div className="flex space-x-4">
          <Link 
            href="/" 
            className={`flex items-center space-x-2 transition-colors ${pathname === '/' ? '' : 'hover:text-gray-300'}`}
          >
            <span>Home</span>
          </Link>
          <Link 
            href="/interview" 
            className={`flex items-center space-x-2 transition-colors ${pathname === '/interview' ? 'text-green-300' : 'hover:text-gray-300'}`}
          >
            <span>Interview</span>
          </Link>
        </div>
        <SignedOut>
          <SignInButton />
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
        {/* <div className="relative" ref={profileMenuRef}>
          <button 
            onClick={toggleProfile}
            className="flex items-center space-x-2 focus:outline-none"
          >
            <img 
              src="/images/default_user_image.jpg?height=32&width=32" 
              alt="User profile" 
              className="w-8 h-8 rounded-full border-0 border-green-400"
            />
            <span className="sr-only">Open user menu</span>
          </button>
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-10">
              <Link 
                href="/profile" 
                className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-green-300"
              >
                <div className="flex items-center space-x-2">
                  <User size={16} />
                  <span>Profile</span>
                </div>
              </Link>
              <button 
                className="w-full text-left block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-green-300"
                onClick={() => {
                  // Add your sign out logic here
                  console.log('Sign out clicked')
                }}
              >
                <div className="flex items-center space-x-2">
                  <LogOut size={16} />
                  <span>Sign out</span>
                </div>
              </button>
            </div>
          )}
        </div> */}
      </div>
    </nav>
  )
}