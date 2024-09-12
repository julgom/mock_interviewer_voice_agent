"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// Video Interface
import { VideoInterface } from "@/components/ui/video-interface";
// Clerk User
import { useUser } from "@clerk/nextjs";
// Firebase
import { db } from "@/firebase";
import { doc, writeBatch } from "firebase/firestore";
// Axios Fetch
import axios from "axios";
// Groq and Llama
import Groq from "groq-sdk";

export default function MockInterviewDashboard() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState("");
  const conversationHistoryRef = useRef([]);
  const [audioQueue, setAudioQueue] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioInitialized, setIsAudioInitialized] = useState(false);
  const audioRef = useRef(null);
  const socketRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [persona, setPersona] = useState("female");
  const selectedVoiceRef = useRef("aura-asteria-en");
  const [resumeText, setResumeText] = useState("");
  const resumeTextRef = useRef("");
  const intervalRef = useRef(null);
  const jobDescriptionRef = useRef("");
  const [jobDescription, setJobDescription] = useState("");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [activeTab, setActiveTab] = useState("text");
  // Time user speech-to-text time

  const groq = new Groq({
    apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
    dangerouslyAllowBrowser: true,
  });

  // User Authentification
  const { isLoaded, isSignedIn, user } = useUser();

  useEffect(() => {
    const initializeUser = async () => {
      console.log("useUser Output:", { isLoaded, isSignedIn, user });
      if (isLoaded && isSignedIn && user) {
        try {
          const name = user.fullName;
          const email = user.primaryEmailAddress?.emailAddress;
          console.log(email, name);

          // Create a write batch
          const batch = writeBatch(db);

          // Reference to the user's document in Firestore
          const userDocRef = doc(db, "users", user.id);

          // Combine fields into a single object
          const userData = {
            name: name,
            email: email,
          };

          // Set the document with the combined object
          batch.set(userDocRef, userData, { merge: true });

          // Commit the batch
          await batch.commit();

          console.log("User document initialized with name and email");
        } catch (error) {
          console.error("Error initializing user document:", error);
        }
      }
    };

    initializeUser();
  }, [isLoaded, isSignedIn, user]);

  // Generate Report
  const generateReport = async () => {
    setIsGeneratingReport(true);
    try {
      // Process the transcript
      const formattedTranscript = conversationHistoryRef.current
        .map((msg) => {
          let content = msg.content.trim();

          // Capitalize the first letter
          content = content.charAt(0).toUpperCase() + content.slice(1);

          if (msg.role === "user") {
            return `You: ${content}`;
          } else if (msg.role === "assistant") {
            return `Interviewer: ${content}`;
          }
          return `${msg.role}: ${content}`; // For any other roles, if they exist
        })
        .join("\n");

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `
                You are an expert interview coach. Analyze the following interview transcript and provide:
                1. A rating out of 10
                2. Three key positives
                3. Three areas for improvement
                4. Three general tips for interview preparation
                Address the interviewee directly using "you" and "your" instead of "the candidate," "the interviewee," or "the applicant."
                Format your response in HTML, using the following structure:
                <h2>Interview Analysis</h2>
                <p><strong>Rating:</strong> [Your rating]/10</p>
                <p>[Your analysis paragraph]</p>
                <h3>Three Key Positives:</h3>
                <ul>
                  <li>[Positive 1]</li>
                  <li>[Positive 2]</li>
                  <li>[Positive 3]</li>
                </ul>
                <h3>Three Areas for Improvement:</h3>
                <ul>
                  <li>[Area 1]</li>
                  <li>[Area 2]</li>
                  <li>[Area 3]</li>
                </ul>
                <h3>Three General Tips for Interview Preparation:</h3>
                <ul>
                  <li>[Tip 1]</li>
                  <li>[Tip 2]</li>
                  <li>[Tip 3]</li>
                </ul>
              `,
          },
          {
            role: "user",
            content: formattedTranscript,
          },
        ],
        model: "llama3-8b-8192",
        max_tokens: 1000,
        temperature: 0.7,
      });

      const aiReport = completion.choices[0]?.message?.content;

      // Wrap the AI report and transcript in a basic HTML structure
      const htmlReport = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your Interview Report</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            h1, h2, h3 { color: #2c3e50; }
            ul { margin-bottom: 20px; }
            pre { white-space: pre-wrap; word-wrap: break-word; background-color: #f8f8f8; padding: 15px; border-radius: 5px; }
          </style>
        </head>
        <body>
          <h1>Your Interview Report</h1>
          ${aiReport}
          <h2>Interview Transcript</h2>
          <pre>${formattedTranscript}</pre>
        </body>
        </html>
      `;

      // Get the user's email address
      const userEmail = user.primaryEmailAddress?.emailAddress;

      if (!userEmail) {
        throw new Error("User email not found");
      }

      // Send email with the HTML report
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: userEmail,
          subject: "Your Interview Report and Transcript",
          content: htmlReport,
        }),
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage += ` - ${errorData.message}`;
        } catch (e) {
          console.error("Could not parse error response:", e);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log(
        "Report and transcript generated and sent to user:",
        data.message
      );
    } catch (error) {
      console.error("Error generating report:", error);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleEndInterview = async () => {
    stopRecording();
    await generateReport();
  };

  // Update the persona state change handler to also set the voice
  const handlePersonaChange = useCallback((value) => {
    const newVoice = value === "male" ? "aura-arcas-en" : "aura-asteria-en";
    setPersona(value);
    selectedVoiceRef.current = newVoice;
    console.log("Voice changed to:", newVoice);
  }, []);

  // Speech to Text
  const startRecording = useCallback(() => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        const socket = new WebSocket("wss://api.deepgram.com/v1/listen", [
          "token",
          process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY,
        ]);
        socketRef.current = socket;

        socket.onopen = () => {
          console.log("WebSocket connection opened");
          intervalRef.current = setInterval(() => {
            setProgress((prevProgress) => {
              if (prevProgress >= 100) {
                clearInterval(intervalRef.current);
                return 100;
              }
              return prevProgress + 100 / (45 * 60);
            });
          }, 1000);
          mediaRecorder.addEventListener("dataavailable", (event) => {
            socket.send(event.data);
          });
          mediaRecorder.start(250);
        };

        socket.onmessage = async (message) => {
          const received = JSON.parse(message.data);
          const transcript = received.channel.alternatives[0].transcript;
          if (transcript.trim()) {
            await processTranscript(transcript);
          }
        };

        setIsRecording(true);
      })
      .catch((err) => console.error("Error accessing microphone:", err));
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    if (socketRef.current) {
      socketRef.current.close();
    }
    setIsRecording(false);
    setProgress(0);
    // Clear interval if it's set
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Text to Text (LLM)
  const getLlamaResponse = async (transcribedText) => {
    try {
      const updatedHistory = [
        ...conversationHistoryRef.current,
        { role: "user", content: transcribedText },
      ];
      conversationHistoryRef.current = updatedHistory; // Update the ref

      console.log("Resume Text: ", resumeTextRef.current);
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `
              You are a hiring manager with a ${persona} name conducting a job interview with an applicant for the position of ${jobDescriptionRef.current}.
              Make up a name for your company that would make sense to be hiring someone for the job description.

              
              Instructions:
              0. Provide context about your company, and asking the applicant if they have experience relevant to that context.
              1. Keep your remarks brief and to the point, use no more than 2 sentences.
              2. Ask no more than one question per response.
              3. Do not greet the user more than once.
              4. Avoid lengthy introductions or explanations.
              5. If you need more information, ask a single, specific follow-up question.
              6. Always refer to the correct job title in your responses.
              
              Remember, your goal is to conduct an efficient and focused interview.
            `,
          },
          ...updatedHistory,
        ],
        model: "llama3-8b-8192",
        max_tokens: 75,
        temperature: 0.3,
      });

      const responseContent = completion.choices[0]?.message?.content;

      // Update the ref again with the AI's response
      conversationHistoryRef.current = [
        ...conversationHistoryRef.current,
        { role: "assistant", content: responseContent },
      ];

      console.log("AI response:", responseContent);
      return responseContent;
    } catch (error) {
      console.error("Error in getLlamaResponse:", error);
      return "I'm sorry, there was an error processing your response.";
    }
  };

  // Text to Speech
  const convertTextToSpeech = async (text) => {
    try {
      const currentVoice = selectedVoiceRef.current;
      const response = await axios.post(
        `https://api.deepgram.com/v1/speak?model=${currentVoice}`,
        { text },
        {
          headers: {
            Authorization: `Token ${process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY}`,
            "Content-Type": "application/json",
          },
          responseType: "arraybuffer",
          params: {
            format: "mp3", // Use a more efficient format
            quality: "low", // Lower quality for faster processing
          },
        }
      );

      const audioBlob = new Blob([response.data], { type: "audio/mp3" });
      const audioUrl = URL.createObjectURL(audioBlob);
      console.log("Audio URL created:", audioUrl);
      return audioUrl;
    } catch (error) {
      console.error("Error converting text to speech:", error);
      return null;
    }
  };

  // Process transcript and generate response
  const processTranscript = async (transcript) => {
    console.log("Processing transcript:", transcript);

    // Capitalize the first letter of the user's sentence
    const capitalizedTranscript =
      transcript.charAt(0).toUpperCase() + transcript.slice(1);
    // Add the user's transcribed text with "Me:" prefix
    setTranscription((prev) =>
      prev
        ? `${prev}\nMe: ${capitalizedTranscript}`
        : `Me: ${capitalizedTranscript}`
    );

    const aiResponse = await getLlamaResponse(transcript);

    // Add the AI's response with "Interviewer:" prefix
    setTranscription((prev) => `${prev}\nInterviewer: ${aiResponse}`);

    const audioUrl = await convertTextToSpeech(aiResponse);
    if (audioUrl) {
      console.log("Adding to audio queue:", audioUrl);
      setAudioQueue((prevQueue) => [...prevQueue, audioUrl]);
    }
  };

  // Audio playback
  useEffect(() => {
    if (
      audioQueue.length > 0 &&
      !isPlaying &&
      audioRef.current &&
      isAudioInitialized
    ) {
      console.log("Playing next audio in queue");
      setIsPlaying(true);
      audioRef.current.src = audioQueue[0];
      audioRef.current
        .play()
        .catch((error) => console.error("Error playing audio:", error));
    }
  }, [audioQueue, isPlaying, isAudioInitialized]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.onended = () => {
        console.log("Audio playback ended");
        setIsPlaying(false);
        setAudioQueue((prevQueue) => prevQueue.slice(1));
      };
    }
  }, []);
  // End audio playback

  // Initialize audio
  useEffect(() => {
    const initializeAudio = () => {
      audioRef.current = new Audio();
      audioRef.current.onended = () => {
        setIsPlaying(false);
        setAudioQueue((prevQueue) => prevQueue.slice(1));
      };
      setIsAudioInitialized(true);
    };

    // Initialize audio on first user interaction
    const handleInteraction = () => {
      if (!isAudioInitialized) {
        initializeAudio();
        document.removeEventListener("click", handleInteraction);
      }
    };

    document.addEventListener("click", handleInteraction);

    return () => {
      document.removeEventListener("click", handleInteraction);
    };
  }, []);
  // End initialize audio

  // Function to handle job description text input
  const handleJobDescriptionTextChange = (e) => {
    const newValue = e.target.value;
    setJobDescription(newValue);
    jobDescriptionRef.current = newValue;
  };

  // Handle File Changes.
  const handleFileChange = async (e, type) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      try {
        console.log("File selected:", file.name, "Size:", file.size);

        const formData = new FormData();
        formData.append("file", file);

        console.log("Sending request to /api/parse-pdf");
        const response = await fetch("/api/parse-pdf", {
          method: "POST",
          body: formData,
        });

        console.log("Response status:", response.status);
        console.log("Response headers:", Object.fromEntries(response.headers));

        const data = await response.json();
        console.log("Response data received");

        if (!response.ok) {
          throw new Error(
            JSON.stringify({
              error: data.error,
              details: data.details,
              status: response.status,
            })
          );
        }

        const fullText = data.fullText || "No text content found";
        if (type === "resume") {
          setResumeText(fullText);
          resumeTextRef.current = fullText;
          console.log("Resume text updated, length:", fullText.length);
        } else if (type === "jobDescription") {
          setJobDescription(fullText);
          jobDescriptionRef.current = fullText;
          console.log("Job description updated, length:", fullText.length);
        }

        console.log("File processed successfully");
      } catch (error) {
        console.error("Error in handleFileChange:", error);
        // Handle error (e.g., show an error message to the user)
      }
    }
  };

  return (
    <div className="flex-1 flex">
      <div className="w-2/3 p-4 flex flex-col">
        <VideoInterface persona={persona} />

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
              {resumeText && <p className="text-sm text-gray-600 mt-1"></p>}
              {/* <PDFParser
                onParsed={(text) => handleParsedPDF(text, "resume")}
                fileType="resume"
              /> */}
            </div>
            <div>
              <Label className="text-gray-600">Job Description</Label>
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full space-y-2"
              >
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
                    value={jobDescription}
                    onChange={handleJobDescriptionTextChange}
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
                  {jobDescription && activeTab === "file" && (
                    <p className="text-sm text-gray-600 mt-1"></p>
                  )}
                  {/* {activeTab === "file" && (
                    <PDFParser
                      onParsed={(text) =>
                        handleParsedPDF(text, "jobDescription")
                      }
                      fileType="jobDescription"
                    />
                  )} */}
                </TabsContent>
                {/* <Button
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800"
                // onClick={}
              >
                Submit
              </Button> */}
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
          <RadioGroup value={persona} onValueChange={handlePersonaChange}>
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
            onClick={startRecording}
            // disabled={
            //   !parsedResumeText || !currentJobDescription || interviewStarted
            // }
          >
            {isRecording ? "Interview in Progress" : "Start Interview"}
          </Button>
          <Button
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 transition-colors duration-200 ease-in-out transform hover:scale-100 active:scale-95 cursor-pointer"
            onClick={handleEndInterview}
            disabled={!isRecording || isGeneratingReport}
          >
            {isGeneratingReport ? "Generating Report..." : "End Interview"}
          </Button>
        </div>
      </div>
    </div>
  );
}
