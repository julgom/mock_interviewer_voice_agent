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
//
import { useUser } from "@clerk/nextjs";
// Firebase
import { db } from "@/firebase";
import { doc, writeBatch } from "firebase/firestore";
//
import axios from "axios";
// Groq and Llama
import Groq from "groq-sdk";
import debounce from "lodash/debounce";
// For PDF parsing
import * as pdfjsLib from "pdfjs-dist/webpack";

export default function MockInterviewDashboard() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [conversationHistory, setConversationHistory] = useState([]);
  const [audioQueue, setAudioQueue] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioInitialized, setIsAudioInitialized] = useState(false);
  const audioRef = useRef(null);
  const socketRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const groq = new Groq({
    apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
    dangerouslyAllowBrowser: true,
  });

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
          mediaRecorder.addEventListener("dataavailable", (event) => {
            socket.send(event.data);
          });
          mediaRecorder.start(250);
        };

        socket.onmessage = async (message) => {
          const received = JSON.parse(message.data);
          const transcript = received.channel.alternatives[0].transcript;
          if (transcript.trim()) {
            setTranscription((prev) => prev + " " + transcript);
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
  }, []);

  // Text to Text (LLM)
  const getLlamaResponse = async (transcribedText) => {
    try {
      const updatedHistory = [
        ...conversationHistory,
        { role: "user", content: transcribedText },
      ];

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content:
              "You are an AI assistant. Keep your responses brief and to the point.",
          },
          ...updatedHistory,
        ],
        model: "llama3-8b-8192",
        max_tokens: 50,
        temperature: 0.7,
      });

      const responseContent = completion.choices[0]?.message?.content;
      setConversationHistory([
        ...updatedHistory,
        { role: "assistant", content: responseContent },
      ]);

      console.log("AI response:", responseContent); // Add this log
      return responseContent;
    } catch (error) {
      console.error("Error in getLlamaResponse:", error);
      return "I'm sorry, there was an error processing your response.";
    }
  };

  // Text to Speech
  const convertTextToSpeech = async (text) => {
    try {
      console.log("Converting to speech:", text);
      const response = await axios.post(
        `https://api.deepgram.com/v1/speak?model=aura-asteria-en`,
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
    const aiResponse = await getLlamaResponse(transcript);
    setTranscription((prev) => prev + "\nAI: " + aiResponse);

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

  // Add this new effect to initialize audio
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

  return (
    <div className="flex flex-col p-4 space-y-4">
      <Textarea
        value={transcription}
        readOnly
        placeholder="Transcription will appear here..."
        className="w-full h-64"
      />
      <div className="flex space-x-2">
        <Button
          onClick={isRecording ? stopRecording : startRecording}
          className={isRecording ? "bg-red-500" : "bg-green-500"}
        >
          {isRecording ? "Stop Recording" : "Start Recording"}
        </Button>
      </div>
    </div>
  );
}

// const [resumeText, setResumeText] = useState("");
// const [resume, setResume] = useState(null);
// const [jobDescription, setJobDescription] = useState(null);
// const [jobDescriptionText, setJobDescriptionText] = useState("");
// const [persona, setPersona] = useState("female");
// const [progress, setProgress] = useState(0);
// const intervalRef = useRef(null);
// const [interviewStarted, setInterviewStarted] = useState(false);
// // For Interview Transcription
// const [isRecording, setIsRecording] = useState(false);
// const [mediaRecorder, setMediaRecorder] = useState(null);
// const [transcription, setTranscription] = useState("");
// const [aiResponses, setAiResponses] = useState([]);
// const [currentTranscript, setCurrentTranscript] = useState("");
// const debouncedGetResponse = useRef(null);
// const socketRef = useRef(null);
// const [conversationHistory, setConversationHistory] = useState([]);
// // For Text to Audio
// const [audioQueue, setAudioQueue] = useState([]);
// const [isPlaying, setIsPlaying] = useState(false);
// const audioRef = useRef(null);
// // State for selecting voice
// const [selectedVoice, setSelectedVoice] = useState("aura-asteria-en");
// // For parsed Resume and Job description PDFs
// const [parsedResumeText, setParsedResumeText] = useState("");
// const [parsedJobDescriptionText, setParsedJobDescriptionText] = useState("");
// //
// const [currentJobDescription, setCurrentJobDescription] = useState("");
// // For Turn Taking

// // User Authentification
// const { isLoaded, isSignedIn, user } = useUser();
// useEffect(() => {
//   const initializeUser = async () => {
//     console.log("useUser Output:", { isLoaded, isSignedIn, user });
//     if (isLoaded && isSignedIn && user) {
//       try {
//         const name = user.fullName;
//         const email = user.primaryEmailAddress?.emailAddress;
//         console.log(email, name);

//         // Create a write batch
//         const batch = writeBatch(db);

//         // Reference to the user's document in Firestore
//         const userDocRef = doc(db, "users", user.id);

//         // Combine fields into a single object
//         const userData = {
//           name: name,
//           email: email,
//         };

//         // Set the document with the combined object
//         batch.set(userDocRef, userData, { merge: true });

//         // Commit the batch
//         await batch.commit();

//         console.log("User document initialized with name and email");
//       } catch (error) {
//         console.error("Error initializing user document:", error);
//       }
//     }
//   };

//   initializeUser();
// }, [isLoaded, isSignedIn, user]);

// // Begin For Text to Speech
// const selectedVoiceRef = useRef("aura-asteria-en");

// useEffect(() => {
//   selectedVoiceRef.current = selectedVoice;
// }, [selectedVoice]);

// const convertTextToSpeech = async (text) => {
//   try {
//     const currentVoice = selectedVoiceRef.current;
//     console.log("Sending request to Deepgram with:", {
//       text,
//       model: currentVoice,
//     });
//     const response = await axios.post(
//       `https://api.deepgram.com/v1/speak?model=${currentVoice}`,
//       {
//         text,
//       },
//       {
//         headers: {
//           Authorization: `Token ${process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY}`,
//           "Content-Type": "application/json",
//         },
//         responseType: "arraybuffer",
//       }
//     );

//     const audioBlob = new Blob([response.data], { type: "audio/wav" });
//     const audioUrl = URL.createObjectURL(audioBlob);

//     return audioUrl;
//   } catch (error) {
//     console.error("Error converting text to speech:", error);
//     return null;
//   }
// };

// // Update the persona state change handler to also set the voice
// const handlePersonaChange = useCallback((value) => {
//   const newVoice = value === "male" ? "aura-arcas-en" : "aura-asteria-en";
//   setPersona(value);
//   setSelectedVoice(newVoice);
//   selectedVoiceRef.current = newVoice;
//   console.log("Voice changed to:", newVoice);
// }, []);

// const playNextInQueue = useCallback(() => {
//   if (audioQueue.length > 0 && !isPlaying && audioRef.current) {
//     setIsPlaying(true);
//     const nextAudio = audioQueue[0];
//     audioRef.current.src = nextAudio;
//     audioRef.current.play();
//   }
// }, [audioQueue, isPlaying]);

// useEffect(() => {
//   // Initialize Audio object on the client side
//   audioRef.current = new Audio();
// }, []);

// useEffect(() => {
//   if (audioRef.current) {
//     audioRef.current.onended = () => {
//       setIsPlaying(false);
//       setAudioQueue((prevQueue) => prevQueue.slice(1));
//     };
//   }
// }, []);

// useEffect(() => {
//   playNextInQueue();
// }, [audioQueue, playNextInQueue]);
// // End for Text to Speech

// // For Generating LLM response to applicant with Groq and Llama
// const groq = new Groq({
//   apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
//   dangerouslyAllowBrowser: true,
// });

// const getLlamaResponse = async (transcribedText) => {
//   console.log("getLlamaResponse transcribedText: ", transcribedText);
//   console.log(
//     "getLlamaResponse Current Job Description:",
//     currentJobDescription
//   );

//   try {
//     if (!process.env.NEXT_PUBLIC_GROQ_API_KEY) {
//       throw new Error("GROQ API key is not set");
//     }

//     const updatedHistory = [
//       ...conversationHistory,
//       { role: "user", content: transcribedText },
//     ];

//     const completion = await groq.chat.completions.create({
//       messages: [
//         {
//           role: "system",
//           content: `
//             You are an AI interviewer with a ${persona} persona conducting a job interview for the position of ${currentJobDescription}.
//             The candidate's resume contains the following information:
//             ${parsedResumeText}

//             Instructions for your responses:
//             1. Keep your remarks brief and to the point, in less than 3 sentences.
//             2. Ask only one question at a time.
//             3. Do not greet the user more than once.
//             4. Avoid lengthy introductions or explanations.
//             5. If you need more information, ask a single, specific follow-up question.
//             6. Always refer to the correct job title in your responses.

//             Remember, your goal is to conduct an efficient and focused interview.
//           `,
//         },
//         ...updatedHistory,
//       ],
//       model: "llama3-8b-8192",
//       max_tokens: 70,
//     });

//     console.log("Groq API response:", completion);

//     if (!completion.choices || completion.choices.length === 0) {
//       throw new Error("No choices returned from Groq API");
//     }

//     const responseContent = completion.choices[0]?.message?.content;
//     if (!responseContent) {
//       throw new Error("No content in Groq API response");
//     }

//     setConversationHistory([
//       ...updatedHistory,
//       { role: "assistant", content: responseContent },
//     ]);

//     console.log("AI response:", responseContent);
//     return responseContent;
//   } catch (error) {
//     console.error("Error in getLlamaResponse:", error);
//     return "I'm sorry, there was an error processing your response. Please check the console for more details.";
//   }
// };
// // End Generating LLM response to applicant with Groq and Llama

// const startInterview = () => {
//   console.log("Job Description Text:", currentJobDescription);
//   setInterviewStarted(true);
//   startRecording();
//   intervalRef.current = setInterval(() => {
//     setProgress((prevProgress) => {
//       if (prevProgress >= 100) {
//         clearInterval(intervalRef.current);
//         return 100;
//       }
//       return prevProgress + 100 / (45 * 60);
//     });
//   }, 1000);
//   // getLlamaResponse("Hello, I'm here for the interview.");
// };

// const endInterview = () => {
//   setInterviewStarted(false);
//   setProgress(0);
//   stopRecording();
//   // Stop recording if mediaRecorder is defined
//   if (mediaRecorder) {
//     mediaRecorder.stop();
//     setMediaRecorder(null); // Clear the recorder reference
//   }

//   // Clear interval if it's set
//   if (intervalRef.current) {
//     clearInterval(intervalRef.current);
//     intervalRef.current = null;
//   }

//   // Close WebSocket connection if it's open
//   if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
//     socketRef.current.close();
//     socketRef.current = null; // Clear the socket reference
//   }
// };

// // Begin Handle Transcription
// const processTranscript = useCallback(
//   async (transcript) => {
//     console.log("Processing transcript:", transcript);
//     console.log(
//       "Current Job Description before getLlamaResponse:",
//       currentJobDescription
//     );

//     setTranscription((prev) => prev + "\nUser: " + transcript);

//     const textStartTime = performance.now();
//     const aiResponse = await getLlamaResponse(transcript);
//     const textEndTime = performance.now();
//     const textResponseTime = textEndTime - textStartTime;

//     setTranscription((prev) => prev + "\nAI: " + aiResponse);
//     setAiResponses((prev) => [...prev, aiResponse]);
//     setCurrentTranscript("");

//     // Convert AI response to speech
//     const voiceStartTime = performance.now();
//     const audioUrl = await convertTextToSpeech(aiResponse);
//     const voiceEndTime = performance.now();
//     const voiceResponseTime = voiceEndTime - voiceStartTime;

//     if (audioUrl) {
//       setAudioQueue((prevQueue) => [...prevQueue, audioUrl]);
//       // Calculate and print response time
//       const totalResponseTime = textResponseTime + voiceResponseTime;
//       console.log(
//         `Total response time (text + voice): ${totalResponseTime.toFixed(
//           2
//         )} ms`
//       );
//       console.log(
//         `  - Text generation time: ${textResponseTime.toFixed(2)} ms`
//       );
//       console.log(
//         `  - Voice generation time: ${voiceResponseTime.toFixed(2)} ms`
//       );
//     }
//   },
//   [currentJobDescription, parsedResumeText]
// );

// useEffect(() => {
//   debouncedGetResponse.current = debounce(processTranscript, 500);
//   return () => debouncedGetResponse.current.cancel();
// }, [processTranscript]);

// useEffect(() => {
//   if (isRecording && mediaRecorder) {
//     console.log("Setting up WebSocket connection");
//     const socket = new WebSocket("wss://api.deepgram.com/v1/listen", [
//       "token",
//       process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY,
//     ]);
//     socketRef.current = socket;

//     socket.onopen = () => {
//       console.log("WebSocket connection opened");
//       mediaRecorder.addEventListener("dataavailable", (event) => {
//         socket.send(event.data);
//       });
//       mediaRecorder.start(250);
//     };

//     socket.onmessage = async (message) => {
//       try {
//         const received = JSON.parse(message.data);
//         const transcript = received.channel.alternatives[0].transcript;
//         if (transcript.trim()) {
//           console.log("Received transcript:", transcript);
//           setCurrentTranscript((prev) => prev + " " + transcript);
//           debouncedGetResponse.current(currentTranscript + " " + transcript);
//         }
//       } catch (error) {
//         console.error("Error processing WebSocket message:", error);
//       }
//     };

//     socket.onclose = () => {
//       setIsRecording(false);
//       mediaRecorder.stop();
//     };

//     return () => {
//       socket.close();
//       socketRef.current = null;
//     };
//   }
// }, [isRecording, mediaRecorder]);

// const startRecording = async () => {
//   const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//   const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
//   setMediaRecorder(recorder);
//   setIsRecording(true);
// };

// const stopRecording = () => {
//   setIsRecording(false);
// };
// // End transcription Handle

// const handleFileChange = async (event, fileType) => {
//   const selectedFile = event.target.files[0];
//   if (fileType === "resume") {
//     setResume(selectedFile);
//     // Parse the PDF resume when it's selected
//     const parsedText = await parsePdf(selectedFile);
//     setParsedResumeText(parsedText);
//     setResumeText(parsedText);
//   } else if (fileType === "jobDescription") {
//     setJobDescription(selectedFile);
//     const parsedText = await parsePdf(selectedFile);
//     setParsedJobDescriptionText(parsedText);
//     setJobDescriptionText(parsedText);
//     setCurrentJobDescription(parsedText);
//     console.log("Job Description set to: ", parsedText);
//   }
// };

// // For Processing Submission of Resume and Job Description
// // const handleSubmit = async () => {
// //
// // };

// // Function to parse PDFs
// const parsePdf = async (file) => {
//   return new Promise((resolve) => {
//     const fileReader = new FileReader();
//     fileReader.onload = async (event) => {
//       const typedArray = new Uint8Array(event.target.result);
//       const pdf = await pdfjsLib.getDocument(typedArray).promise;
//       let fullText = "";

//       for (let i = 1; i <= pdf.numPages; i++) {
//         const page = await pdf.getPage(i);
//         const textContent = await page.getTextContent();
//         const pageText = textContent.items.map((item) => item.str).join(" ");
//         fullText += pageText + "\n";
//       }

//       resolve(fullText);
//     };
//     fileReader.readAsArrayBuffer(file);
//   });
// };

// // Function to handle job description text input
// const handleJobDescriptionTextChange = (e) => {
//   const newText = e.target.value;
//   setJobDescriptionText(newText);
//   setCurrentJobDescription(newText);
// };

//   return (
//     <div className="flex-1 flex">
//       <div className="w-2/3 p-4 flex flex-col">
//         <VideoInterface />

//         <div className="bg-white rounded-lg p-4 shadow-md">
//           <div className="flex justify-between items-center mb-2">
//             <h2 className="text-xl font-bold text-gray-800">
//               Interview Progress
//             </h2>
//             <span className="text-gray-700 font-semibold">
//               {Math.round(progress)}% Complete
//             </span>
//           </div>
//           <Progress value={progress} className="w-full bg-gray-200" />
//           <div className="mt-4">
//             <span className="text-gray-600">
//               Time Remaining:{" "}
//               {Math.max(0, 45 - Math.floor((progress * 45) / 100))} minutes
//             </span>
//           </div>
//         </div>
//       </div>

//       <div className="w-1/3 bg-white p-4 flex flex-col shadow-lg overflow-y-auto">
//         <div className="mb-6">
//           <h3 className="text-lg font-semibold mb-2 text-gray-700">
//             Upload Documents
//           </h3>
//           <div className="space-y-4">
//             <div className="space-y-2">
//               <Label htmlFor="resume" className="text-gray-600">
//                 Select your resume (PDF format)
//               </Label>
//               <Input
//                 id="resume"
//                 type="file"
//                 accept=".pdf"
//                 onChange={(e) => handleFileChange(e, "resume")}
//                 className="border-gray-300"
//               />
//               {resume && (
//                 <p className="text-sm text-gray-600 mt-1">
//                   Selected file: {resume.name}
//                 </p>
//               )}
//             </div>
//             <div>
//               <Label className="text-gray-600">Job Description</Label>
//               <Tabs defaultValue="text" className="w-full space-y-2">
//                 <TabsList className="bg-gray-100">
//                   <TabsTrigger
//                     value="text"
//                     className="data-[state=active]:bg-white data-[state=active]:text-teal-500"
//                   >
//                     Text Input
//                   </TabsTrigger>
//                   <TabsTrigger
//                     value="file"
//                     className="data-[state=active]:bg-white data-[state=active]:text-teal-500"
//                   >
//                     File Upload
//                   </TabsTrigger>
//                 </TabsList>
//                 <TabsContent value="text">
//                   <Textarea
//                     placeholder="Enter job description here..."
//                     value={jobDescriptionText}
//                     onChange={handleJobDescriptionTextChange}
//                     className="border-gray-300 focus-visible:ring-transparent"
//                   />
//                 </TabsContent>
//                 <TabsContent value="file">
//                   <Input
//                     id="jobDescription"
//                     type="file"
//                     accept=".pdf"
//                     onChange={(e) => handleFileChange(e, "jobDescription")}
//                     className="border-gray-300"
//                   />
//                   {jobDescription && (
//                     <p className="text-sm text-gray-600 mt-1">
//                       Selected file: {jobDescription.name}
//                     </p>
//                   )}
//                 </TabsContent>
//                 {/* <Button
//                   className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800"
//                   // onClick={}
//                 >
//                   Submit
//                 </Button> */}
//               </Tabs>
//             </div>
//           </div>
//         </div>
//         <div className="flex-1 mb-4">
//           <Textarea
//             value={transcription}
//             readOnly
//             placeholder="Transcription will appear here..."
//             className="w-full h-full"
//             aria-label="Speech to Text Transcription"
//           />
//         </div>
//         <div className="mb-6">
//           <h3 className="text-lg font-semibold mb-2 text-gray-700">
//             Select Interviewer
//           </h3>
//           <RadioGroup value={persona} onValueChange={handlePersonaChange}>
//             <div className="flex items-center space-x-2">
//               <RadioGroupItem
//                 value="female"
//                 id="female"
//                 className="border-gray-400 text-teal-500"
//               />
//               <Label htmlFor="female" className="text-gray-600">
//                 Female Voice
//               </Label>
//             </div>
//             <div className="flex items-center space-x-2">
//               <RadioGroupItem
//                 value="male"
//                 id="male"
//                 className="border-gray-400 text-teal-500"
//               />
//               <Label htmlFor="male" className="text-gray-600">
//                 Male Voice
//               </Label>
//             </div>
//           </RadioGroup>
//         </div>
//         <div className="mt-auto space-y-2">
//           <Button
//             className="w-full bg-teal-500 hover:bg-teal-600 text-white transition-colors duration-200 ease-in-out transform hover:scale-100 active:scale-95 cursor-pointer"
//             onClick={startInterview}
//             disabled={
//               !parsedResumeText || !currentJobDescription || interviewStarted
//             }
//           >
//             {interviewStarted ? "Interview in Progress" : "Start Interview"}
//           </Button>
//           <Button
//             className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 transition-colors duration-200 ease-in-out transform hover:scale-100 active:scale-95 cursor-pointer"
//             onClick={endInterview}
//             disabled={!interviewStarted}
//           >
//             End Interview
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }
