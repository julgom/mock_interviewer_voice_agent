"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { VideoInterface } from "@/components/video-interface"

import { useClerk } from "@clerk/nextjs";
import {useUser} from '@clerk/nextjs'
import { db } from '@/firebase';
import {doc, writeBatch} from 'firebase/firestore'

import axios from 'axios';


export default function MockInterviewDashboard() {
  const [resume, setResume] = useState(null);
  const [jobDescription, setJobDescription] = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [jobDescriptionText, setJobDescriptionText] = useState("");

  const [persona, setPersona] = useState("female");
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef(null);
  const [interviewStarted, setInterviewStarted] = useState(false);
  // For Transcription
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [transcription, setTranscription] = useState("");
  const socketRef = useRef(null);


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


  const handleFileChange = (event, fileType) => {
    const selectedFile = event.target.files[0];
    if (fileType === "resume") {
      setResume(selectedFile);
    } else {
      setJobDescription(selectedFile);
    }
  };


  const handleSubmit = async () => {
    if (resume && (jobDescription || jobDescriptionText)) {
      let processResume = "";
      let procesJobDescription = "";

      // Process resume file
      if (resume) {
        //processResume = await fileToText(resume);
        processResume = await fileToText(resume, 'resume');
        
      }

      // Process job description file
      if (jobDescription) {
        //procesJobDescription = await fileToText(jobDescription);
        procesJobDescription = await fileToText(jobDescription, 'jobDescription');

         //const jobDescriptionTextContent = await fileToText(jobDescription);
         //jobDescriptionTextContent = jobDescriptionTextContent;
      } 
      setResumeText(processResume)
      setJobDescriptionText(procesJobDescription)
      console.log("Resume Text:", resumeText);
      console.log("Job Description Text:", jobDescriptionText);
    } else {
      alert("Please upload both a resume and a job description.");
    }
  };

  const fileToText = async (file, type) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
  
    try {
      const response = await axios.post('http://localhost:5000/process-file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
  
      return response.data.text;
    } catch (error) {
      console.error('Error uploading file:', error);
      return '';
    }
  };
  
  
  const startInterview = () => {
    setInterviewStarted(true);
    startRecording();
    intervalRef.current = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(intervalRef.current);
          return 100;
        }
        return prevProgress + 100 / (45 * 60);
      });
    }, 1000);
  };

  const endInterview = () => {
    setInterviewStarted(false);
    setProgress(0);
    stopRecording();
    // Stop recording if mediaRecorder is defined
    if (mediaRecorder) {
      mediaRecorder.stop();
      setMediaRecorder(null); // Clear the recorder reference
    }

    // Clear interval if it's set
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Close WebSocket connection if it's open
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.close();
      socketRef.current = null; // Clear the socket reference
    }
  };

  // Begin Handle Transcription
  useEffect(() => {
    if (isRecording && mediaRecorder) {
      const socket = new WebSocket("wss://api.deepgram.com/v1/listen", [
        "token",
        process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY,
      ]);
      socketRef.current = socket;

      socket.onopen = () => {
        mediaRecorder.addEventListener("dataavailable", (event) => {
          socket.send(event.data);
        });
        mediaRecorder.start(250);
      };

      socket.onmessage = (message) => {
        const received = JSON.parse(message.data);
        const transcript = received.channel.alternatives[0].transcript;
        setTranscription((prev) => prev + " " + transcript);
      };

      socket.onclose = () => {
        setIsRecording(false);
        mediaRecorder.stop();
      };

      return () => {
        socket.close();
        socketRef.current = null;
      };
    }
  }, [isRecording, mediaRecorder]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream, { mimeType: "audio/mp4" });
    setMediaRecorder(recorder);
    setIsRecording(true);
  };

  const stopRecording = () => {
    setIsRecording(false);
  };
  // End transcription Handle
  
 

  return (
    <div className="flex-1 flex">
      <div className="w-2/3 p-4 flex flex-col">
        <VideoInterface />
        
        <div className="bg-white rounded-lg p-4 shadow-md">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-bold text-gray-800">
              Interview Progress
            </h2>
            <span className="text-gray-700 font-semibold">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="w-full bg-gray-200" />
          <div className="mt-4">
            <span className="text-gray-600">
              Time Remaining:{" "}
              {Math.max(0, 45 - Math.floor((progress * 45) / 100))} minutes
            </span>
          </div>
        </div>
      </div>

      <div className="w-1/3 bg-white p-4 flex flex-col shadow-lg overflow-y-auto">
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">
            Upload Documents
          </h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="resume" className="text-gray-600">
                Select your resume (PDF format)
              </Label>
              <Input
                id="resume"
                type="file"
                accept=".pdf"
                onChange={(e) => handleFileChange(e, "resume")}
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
                  <TabsTrigger
                    value="text"
                    className="data-[state=active]:bg-white data-[state=active]:text-teal-500"
                  >
                    Text Input
                  </TabsTrigger>
                  <TabsTrigger
                    value="file"
                    className="data-[state=active]:bg-white data-[state=active]:text-teal-500"
                  >
                    File Upload
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="text">
                  <Textarea
                    placeholder="Enter job description here..."
                    value={jobDescriptionText}
                    onChange={(e) => {
                      setJobDescriptionText(e.target.value);
                    }}
                    className="border-gray-300 focus-visible:ring-transparent"
                  />
                  
                </TabsContent>
                <TabsContent value="file">
                  
                  <Input
                    id="jobDescription"
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handleFileChange(e, "jobDescription")}
                    className="border-gray-300"
                  />
                  {jobDescription && (
                    <p className="text-sm text-gray-600 mt-1">
                      Selected file: {jobDescription.name}
                    </p>
                  )}
                </TabsContent>
                <Button className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800" onClick={handleSubmit}
        >
                  Submit
                </Button>
              </Tabs>
            </div>
          </div>
        </div>

        <div className="flex-1 mb-4">
          <Textarea
            value={transcription}
            readOnly
            placeholder="Transcription will appear here..."
            className="w-full h-full"
            aria-label="Speech to Text Transcription"
          />
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">
            Select Interviewer
          </h3>
          <RadioGroup value={persona} onValueChange={setPersona}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="female"
                id="female"
                className="border-gray-400 text-teal-500"
              />
              <Label htmlFor="female" className="text-gray-600">
                Female Voice
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="male"
                id="male"
                className="border-gray-400 text-teal-500"
              />
              <Label htmlFor="male" className="text-gray-600">
                Male Voice
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="mt-auto space-y-2">
          <Button
            className="w-full bg-teal-500 hover:bg-teal-600 text-white transition-colors duration-200 ease-in-out transform hover:scale-100 active:scale-95 cursor-pointer"
            onClick={startInterview}
            //disabled={!resume || (!jobDescription && !jobDescriptionText) || interviewStarted}
          >
            {interviewStarted ? "Interview in Progress" : "Start Interview"}
          </Button>
          <Button
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 transition-colors duration-200 ease-in-out transform hover:scale-100 active:scale-95 cursor-pointer"
            onClick={endInterview}
            disabled={!interviewStarted}
          >
            End Interview
          </Button>
        </div>
      </div>
    </div>
  );
}
/*

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MockInterviewDashboard() {
  const [resume, setResume] = useState(null);
  const [jobDescription, setJobDescription] = useState(null);
  const [jobDescriptionText, setJobDescriptionText] = useState("");
  const [persona, setPersona] = useState("female");
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef(null);
  const [interviewStarted, setInterviewStarted] = useState(false);
  // For Transcription
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [transcription, setTranscription] = useState("");
  const socketRef = useRef(null);

  const handleFileChange = (event, fileType) => {
    const selectedFile = event.target.files[0];
    if (fileType === "resume") {
      setResume(selectedFile);
    } else {
      setJobDescription(selectedFile);
    }
  };

  const startInterview = () => {
    setInterviewStarted(true);
    startRecording();
    intervalRef.current = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(intervalRef.current);
          return 100;
        }
        return prevProgress + 100 / (45 * 60);
      });
    }, 1000);
  };

  const endInterview = () => {
    setInterviewStarted(false);
    setProgress(0);
    stopRecording();
    // Stop recording if mediaRecorder is defined
    if (mediaRecorder) {
      mediaRecorder.stop();
      setMediaRecorder(null); // Clear the recorder reference
    }

    // Clear interval if it's set
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Close WebSocket connection if it's open
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.close();
      socketRef.current = null; // Clear the socket reference
    }
  };

  // Begin Handle Transcription
  useEffect(() => {
    if (isRecording && mediaRecorder) {
      const socket = new WebSocket("wss://api.deepgram.com/v1/listen", [
        "token",
        process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY,
      ]);
      socketRef.current = socket;

      socket.onopen = () => {
        mediaRecorder.addEventListener("dataavailable", (event) => {
          socket.send(event.data);
        });
        mediaRecorder.start(250);
      };

      socket.onmessage = (message) => {
        const received = JSON.parse(message.data);
        const transcript = received.channel.alternatives[0].transcript;
        setTranscription((prev) => prev + " " + transcript);
      };

      socket.onclose = () => {
        setIsRecording(false);
        mediaRecorder.stop();
      };

      return () => {
        socket.close();
        socketRef.current = null;
      };
    }
  }, [isRecording, mediaRecorder]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
    setMediaRecorder(recorder);
    setIsRecording(true);
  };

  const stopRecording = () => {
    setIsRecording(false);
  };
  // End transcription Handle

  // Handle Submit
  const handleSubmit = async () => {
    if (resume && (jobDescription || jobDescriptionText)) {
      let resumeText = "";
      let jobDescriptionTextContent = "";

      // Process resume file
      if (resume) {
        const resumeTextContent = await fileToText(resume);
        resumeText = resumeTextContent;
      }

      // Process job description file
      if (jobDescription) {
         jobDescriptionTextContent = await fileToText(jobDescription);

         //const jobDescriptionTextContent = await fileToText(jobDescription);
         //jobDescriptionTextContent = jobDescriptionTextContent;
      } else {
        jobDescriptionTextContent = jobDescriptionText;
      }

      console.log("Resume Text:", resumeText);
      console.log("Job Description Text:", jobDescriptionTextContent);
    } else {
      alert("Please upload both a resume and a job description.");
    }
  };

  // Utility function to extract text from file
  const fileToText = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  return (
    <div className="flex-1 flex">
      <div className="w-2/3 p-4 flex flex-col">
        <div className="bg-black flex-grow rounded-lg flex items-center justify-center mb-4 border-4">
          <span className="text-white text-2xl">AI Interviewer Video Feed</span>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-md">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-bold text-gray-800">
              Interview Progress
            </h2>
            <span className="text-gray-700 font-semibold">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="w-full bg-gray-200" />
          <div className="mt-4">
            <span className="text-gray-600">
              Time Remaining:{" "}
              {Math.max(0, 45 - Math.floor((progress * 45) / 100))} minutes
            </span>
          </div>
        </div>
      </div>

      <div className="w-1/3 bg-white p-4 flex flex-col shadow-lg overflow-y-auto">
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">
            Upload Documents
          </h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="resume" className="text-gray-600">
                Select your resume (PDF format)
              </Label>
              <Input
                id="resume"
                type="file"
                accept=".pdf"
                onChange={(e) => handleFileChange(e, "resume")}
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
                  <TabsTrigger
                    value="text"
                    className="data-[state=active]:bg-white data-[state=active]:text-teal-500"
                  >
                    Text Input
                  </TabsTrigger>
                  <TabsTrigger
                    value="file"
                    className="data-[state=active]:bg-white data-[state=active]:text-teal-500"
                  >
                    File Upload
                  </TabsTrigger>
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
                    onChange={(e) => handleFileChange(e, "jobDescription")}
                    className="border-gray-300"
                  />
                  {jobDescription && (
                    <p className="text-sm text-gray-600 mt-1">
                      Selected file: {jobDescription.name}
                    </p>
                  )}
                </TabsContent>
                <Button className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800" onClick={handleSubmit}>
                  Submit
                </Button>
              </Tabs>
            </div>
          </div>
        </div>

        <div className="flex-1 mb-4">
          <Textarea
            value={transcription}
            readOnly
            placeholder="Transcription will appear here..."
            className="w-full border-gray-300"
          />
        </div>

        <div className="flex justify-between space-x-2">
          <Button
            onClick={startInterview}
            className={`w-1/2 bg-blue-500 hover:bg-blue-600 text-white ${
              interviewStarted ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={interviewStarted}
          >
            Start Interview
          </Button>
          <Button
            onClick={endInterview}
            className={`w-1/2 bg-red-500 hover:bg-red-600 text-white ${
              !interviewStarted ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={!interviewStarted}
          >
            End Interview
          </Button>
        </div>
        <Button
          onClick={handleSubmit}
          className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white"
        >
          Submit
        </Button>
      </div>
    </div>
  );
}
*/