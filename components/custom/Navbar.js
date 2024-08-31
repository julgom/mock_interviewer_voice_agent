'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User, LogOut } from 'lucide-react'
import { SignedIn, SignedOut, UserButton, SignInButton, useAuth } from '@clerk/nextjs'

export default function Navbar() {
  const pathname = usePathname()
  // For loading Auth state.
  const [loading, setLoading] = useState(true);
  const { isLoaded, user, isSignedIn } = useAuth();
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    if (isLoaded) {
      setLoading(false);
      console.log("User is loaded:", user);
      console.log("Auth state:", { isLoaded, isSignedIn, userId: user?.id })
    }
  }, [isLoaded, user]);
    // End For loading Auth state.

  return (
    <nav className="bg-black text-gray-200 p-4">
      <div className="px-3 mx-auto flex justify-between items-center">
        <div className="flex space-x-4">
          <Link 
            href="/" 
            className={`flex items-center space-x-2 transition-colors ${pathname === '/' ? 'text-teal-300' : 'hover:text-gray-300'}`}
          >
            <span>Home</span>
          </Link>
          <Link 
            href="/interview" 
            className={`flex items-center space-x-2 transition-colors ${pathname === '/interview' ? 'text-teal-300' : 'hover:text-gray-300'}`}
          >
            <span>Interview</span>
          </Link>
        </div>
        {isMounted && (
          <>
            <SignedOut>
              <Link href="/sign-in">
                <button>Sign in</button>
              </Link>
            </SignedOut>
            <SignedIn>
              {isLoaded && <UserButton />}
            </SignedIn>
          </>
        )}
      </div>
    </nav>
  )
}