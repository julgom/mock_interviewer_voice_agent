"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, CameraOff, Maximize2, Minimize2 } from "lucide-react";

export function VideoInterface({ persona }) {
  const [stream, setStream] = useState(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [mainDisplay, setMainDisplay] = useState("ai");
  const videoRefLarge = useRef(null);
  const videoRefMini = useRef(null);

  const interviewerImage =
    persona === "female"
      ? "images/interviewer_image_female.jpg"
      : "images/interviewer_image_male.jpg";

  useEffect(() => {
    if (cameraOn) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          setStream(stream);
          if (videoRefLarge.current && mainDisplay === "user") {
            videoRefLarge.current.srcObject = stream;
          } else if (videoRefMini.current && mainDisplay === "ai") {
            videoRefMini.current.srcObject = stream;
          }
        })
        .catch((err) => console.error("Error accessing the camera:", err));
    } else {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      setStream(null);
    }
  }, [cameraOn, mainDisplay]);

  const toggleCamera = () => {
    setCameraOn(!cameraOn);
  };

  const switchDisplay = () => {
    setMainDisplay(mainDisplay === "user" ? "ai" : "user");
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-transparent text-white">
      <div className="relative w-full max-w-4xl flex-grow aspect-video rounded-lg overflow-hidden">
        {mainDisplay === "ai" ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-900">
            <Avatar className="w-64 h-64">
              <AvatarImage src={interviewerImage} alt="AI Avatar" />
              <AvatarFallback className="text-black">AI</AvatarFallback>
            </Avatar>
          </div>
        ) : cameraOn ? (
          <video
            ref={videoRefLarge}
            autoPlay
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-700">
            <CameraOff className="w-24 h-24 text-gray-400" />
          </div>
        )}
        <div
          className="absolute bottom-4 right-4 w-48 h-32 rounded-lg overflow-hidden cursor-pointer flex-shrink-0"
          onClick={switchDisplay}
        >
          {mainDisplay === "ai" ? (
            cameraOn ? (
              <video
                ref={videoRefMini}
                autoPlay
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-700">
                <CameraOff className="w-8 h-8 text-gray-400" />
              </div>
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-900">
              <Avatar className="w-16 h-16">
                <AvatarImage src={interviewerImage} alt="AI Avatar" />
                <AvatarFallback className="text-black">AI</AvatarFallback>
              </Avatar>
            </div>
          )}
          {mainDisplay === "ai" ? (
            <Maximize2 className="absolute top-2 right-2 w-6 h-6 text-white opacity-75" />
          ) : (
            <Minimize2 className="absolute top-2 right-2 w-6 h-6 text-white opacity-75" />
          )}
        </div>
      </div>
      <div className="mt-4 space-x-4">
        <Button
          onClick={toggleCamera}
          variant={cameraOn ? "destructive" : "default"}
        >
          {cameraOn ? (
            <CameraOff className="mr-2 h-4 w-4" />
          ) : (
            <Camera className="mr-2 h-4 w-4" />
          )}
          {cameraOn ? "Turn Off Camera" : "Turn On Camera"}
        </Button>
      </div>
    </div>
  );
}
