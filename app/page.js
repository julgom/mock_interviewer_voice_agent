"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { SignedOut } from "@clerk/nextjs";
import Image from "next/image";

export default function Component() {
  const router = useRouter();

  const handleSignInClick = () => {
    router.push("/sign-in");
    initializeUser();
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-sky-50 to-white">
      <section className="w-full">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Welcome to
                <br />
                Career Development
              </h1>
              <div className="flex items-center justify-center space-x-2 text-xl">
                <span className="text-black-600">by</span>{" "}
                <Image
                  src="/images/pixona_logo_2.png"
                  alt="Pixona logo"
                  width={115}
                  height={115}
                  className="inline-block"
                />
              </div>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                Practice the skills you need to land the job.
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
  );
}
