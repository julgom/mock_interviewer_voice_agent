'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function InterviewInterface() {
  const [file, setFile] = useState(null)
  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    // Update the date and time only on the client side
    const updateDateTime = () => {
      setCurrentDate(new Date().toLocaleDateString());
      setCurrentTime(new Date().toLocaleTimeString());
    };

    updateDateTime(); // Set initial values
    const intervalId = setInterval(updateDateTime, 1000); // Update every second

    // Clear interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Applicant's video feed */}
      <div className="w-2/3 p-4">
        <div className="bg-black h-full rounded-lg flex items-center justify-center">
          <span className="text-white text-2xl">Applicant's Video Feed</span>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-1/3 bg-white p-4 flex flex-col">
        {/* Interviewer's avatar */}
        <div className="mb-6 flex items-center">
          <div className="w-16 h-16 rounded-full bg-gray-300 mr-4 overflow-hidden">
            <Image
              src=""
              alt="Interviewer Avatar"
              width={64}
              height={64}
            />
          </div>
          <div>
            <h2 className="text-xl font-bold">Interviewer Name</h2>
            <p className="text-gray-600">Position</p>
          </div>
        </div>

        {/* Resume upload section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Upload Resume</h3>
          <div className="space-y-2">
            <Label htmlFor="resume">Select your resume (PDF format)</Label>
            <Input
              id="resume"
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
            />
            {file && (
              <p className="text-sm text-gray-600">
                Selected file: {file.name}
              </p>
            )}
            <Button className="w-full">
              Upload Resume
            </Button>
          </div>
        </div>

        {/* Additional interview information */}
        <div className="flex-grow">
          <h3 className="text-lg font-semibold mb-2">Interview Details</h3>
          <p className="text-gray-600 mb-1">Date: {currentDate}</p>
          <p className="text-gray-600 mb-1">Time: {currentTime}</p>
          <p className="text-gray-600">Position: Software Developer</p>
        </div>

        {/* Interview controls */}
        <div className="mt-auto">
          <Button className="w-full mb-2" variant="outline">
            End Interview
          </Button>
          <Button className="w-full">
            Start Interview
          </Button>
        </div>
      </div>
    </div>
  )
}