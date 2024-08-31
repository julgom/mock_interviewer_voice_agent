'use client'

import { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function MockInterviewDashboard() {
  const [resume, setResume] = useState(null)
  const [jobDescription, setJobDescription] = useState(null)
  const [jobDescriptionText, setJobDescriptionText] = useState('')
  const [persona, setPersona] = useState('female')
  const [interviewStarted, setInterviewStarted] = useState(false)
  const [progress, setProgress] = useState(0)
  const intervalRef = useRef(null)

  const handleFileChange = (event, fileType) => {
    const selectedFile = event.target.files[0]
    if (fileType === 'resume') {
      setResume(selectedFile)
    } else {
      setJobDescription(selectedFile)
    }
  }

  const startInterview = () => {
    setInterviewStarted(true)
    // Simulate interview progress
    intervalRef.current = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(intervalRef.current)
          return 100
        }
        return prevProgress + 100 / (45 * 60) // 45 minutes in seconds
      })
    }, 1000)
  }

  const endInterview = () => {
    setInterviewStarted(false)
    setProgress(0)
    // Add any additional cleanup or end-of-interview logic here
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  return (
    <div className="flex-1 flex">
      {/* Main content area */}
      <div className="w-2/3 p-4 flex flex-col">
        {/* AI Interviewer video feed */}
        <div className="bg-black flex-grow rounded-lg flex items-center justify-center mb-4 border-4">
          <span className="text-white text-2xl">AI Interviewer Video Feed</span>
        </div>

        {/* Interview progress */}
        <div className="bg-white rounded-lg p-4 shadow-md">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-bold text-gray-800">Interview Progress</h2>
            <span className="text-green-600 font-semibold">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="w-full bg-gray-200"/>
          <div className="mt-4">
            <span className="text-gray-600">Time Remaining: {Math.max(0, 45 - Math.floor(progress * 45 / 100))} minutes</span>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-1/3 bg-white p-4 flex flex-col shadow-lg overflow-y-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Mock Interview Dashboard</h1>

        {/* File upload section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">Upload Documents</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="resume" className="text-gray-600">Select your resume (PDF format)</Label>
              <Input
                id="resume"
                type="file"
                accept=".pdf"
                onChange={(e) => handleFileChange(e, 'resume')}
                className="border-gray-300"
              />
              {resume && (
                <p className="text-sm text-gray-600 mt-1">
                  Selected file: {resume.name}
                </p>
              )}
            </div>
            <div>
              <Label className="text-gray-600">Job Description</Label>
              <Tabs defaultValue="text" className="w-full space-y-2">
                <TabsList className="bg-gray-100">
                  <TabsTrigger value="text" className="data-[state=active]:bg-white data-[state=active]:text-teal-500">Text Input</TabsTrigger>
                  <TabsTrigger value="file" className="data-[state=active]:bg-white data-[state=active]:text-teal-500">File Upload</TabsTrigger>
                </TabsList>
                <TabsContent value="text">
                  <Textarea
                    placeholder="Enter job description here..."
                    value={jobDescriptionText}
                    onChange={(e) => setJobDescriptionText(e.target.value)}
                    className="border-gray-300 focus-visible:ring-transparent"
                  />
                </TabsContent>
                <TabsContent value="file">
                  <Input
                    id="jobDescription"
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handleFileChange(e, 'jobDescription')}
                    className="border-gray-300"
                  />
                  {jobDescription && (
                    <p className="text-sm text-gray-600 mt-1">
                      Selected file: {jobDescription.name}
                    </p>
                  )}
                </TabsContent>
                <Button className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800">
                  Submit
                </Button>
              </Tabs>
            </div>
          </div>
        </div>

        {/* Persona selection */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">Select Interviewer</h3>
          <RadioGroup value={persona} onValueChange={setPersona}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="female" id="female" className="border-gray-400 text-teal-500" />
              <Label htmlFor="female" className="text-gray-600">Female Voice</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="male" id="male" className="border-gray-400 text-teal-500" />
              <Label htmlFor="male" className="text-gray-600">Male Voice</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Interview controls */}
        <div className="mt-auto space-y-2">
          <Button 
            className="w-full bg-teal-400 hover:bg-teal-500 text-white transition-colors duration-200 ease-in-out transform hover:scale-100 active:scale-95 cursor-pointer"
            onClick={startInterview}
            //disabled={!resume || (!jobDescription && !jobDescriptionText) || interviewStarted}
          >
            {interviewStarted ? 'Interview in Progress' : 'Start Interview'}
          </Button>
          <Button 
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 transition-colors duration-200 ease-in-out transform hover:scale-100 active:scale-95 cursor-pointer"
            onClick={endInterview}
            //disabled={!interviewStarted}
          >
            End Interview
          </Button>
        </div>
      </div>
    </div>
  );
}