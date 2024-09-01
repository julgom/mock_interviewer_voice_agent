'use client'

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import {useUser} from '@clerk/nextjs'
import { useEffect } from 'react';
import { db } from '@/firebase';
import {doc, writeBatch} from 'firebase/firestore'
import { SignedOut } from '@clerk/nextjs'

export default function Component() {
  const {isLoaded, isSignedIn, user} = useUser()
  useEffect(() => {
    const initializeUser = async () => {
      console.log("useUser Output:", { isLoaded, isSignedIn, user });
        if (isLoaded && isSignedIn && user) {
          try {
            const name = user.fullName;
            const email = user.primaryEmailAddress?.emailAddress;
            console.log(email, name)
  
            // Create a write batch
            const batch = writeBatch(db);
  
            // Reference to the user's document in Firestore
            const userDocRef = doc(db, 'users', user.id);
  
            // Combine fields into a single object
            const userData = {
              name: name,
              email: email
            };
  
            // Set the document with the combined object
            batch.set(userDocRef, userData, { merge: true });
  
            // Commit the batch
            await batch.commit();
  
            console.log('User document initialized with name and email');
          } catch (error) {
            console.error('Error initializing user document:', error);
          }
        }
    };

    initializeUser();
}, [isLoaded, isSignedIn, user]);


  const router = useRouter()

  const handleSignInClick = () => {
    router.push('/sign-in')
  }

  return (
    <div className="flex-1 flex items-center justify-center">
      <section className="w-full">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Welcome to<br/>
                Career Development 
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                Exercise the skills you need to land the job.
              </p>
            </div>
            <SignedOut>
              <Button 
                className="inline-flex h-9 items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90 dark:focus-visible:ring-gray-300"
                onClick={handleSignInClick}
              >
                Sign in
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </SignedOut>
          </div>
        </div>
      </section>
    </div>
  )
}