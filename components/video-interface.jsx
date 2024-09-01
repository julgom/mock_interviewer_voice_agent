/*'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, CameraOff, Maximize2, Minimize2 } from 'lucide-react'

export function VideoInterface() {
  const [stream, setStream] = useState(null)
  const [cameraOn, setCameraOn] = useState(false)
  const [mainDisplay, setMainDisplay] = useState('user')
  const videoRef = useRef(null)

  useEffect(() => {
    if (cameraOn) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          setStream(stream)
          if (videoRef.current) {
            videoRef.current.srcObject = stream
          }
        })
        .catch(err => console.error("Error accessing the camera:", err))
    } else {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
      setStream(null)
    }
  }, [cameraOn])

  const toggleCamera = () => {
    setCameraOn(!cameraOn)
  }

  const switchDisplay = () => {
    setMainDisplay(mainDisplay === 'user' ? 'ai' : 'user')
  }

  return (
    (<div
      className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4">
      <div
        className="relative w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden">
        {mainDisplay === 'user' ? (
          cameraOn ? (
            <video ref={videoRef} autoPlay className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-700">
              <CameraOff className="w-24 h-24 text-gray-400" />
            </div>
          )
        ) : (
          <div
            className="w-full h-full flex items-center justify-center bg-gradient-to-r from-purple-500 to-pink-500">
            <Avatar className="w-64 h-64">
              <AvatarImage src="/ai-avatar.png" alt="AI Avatar" />
              <AvatarFallback>AI</AvatarFallback>
            </Avatar>
          </div>
        )}
        <div
          className="absolute bottom-4 right-4 w-48 h-32 bg-gray-800 rounded-lg overflow-hidden cursor-pointer"
          onClick={switchDisplay}>
          {mainDisplay === 'user' ? (
            <div
              className="w-full h-full flex items-center justify-center bg-gradient-to-r from-purple-500 to-pink-500">
              <Avatar className="w-16 h-16">
                <AvatarImage src="/ai-avatar.png" alt="AI Avatar" />
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
            </div>
          ) : (
            cameraOn ? (
              <video ref={videoRef} autoPlay className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-700">
                <CameraOff className="w-8 h-8 text-gray-400" />
              </div>
            )
          )}
          {mainDisplay === 'user' ? (
            <Maximize2 className="absolute top-2 right-2 w-6 h-6 text-white opacity-75" />
          ) : (
            <Minimize2 className="absolute top-2 right-2 w-6 h-6 text-white opacity-75" />
          )}
        </div>
      </div>
      <div className="mt-4 space-x-4">
        <Button onClick={toggleCamera} variant={cameraOn ? "destructive" : "default"}>
          {cameraOn ? <CameraOff className="mr-2 h-4 w-4" /> : <Camera className="mr-2 h-4 w-4" />}
          {cameraOn ? "Turn Off Camera" : "Turn On Camera"}
        </Button>
      </div>
    </div>)
  );
}

*/'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, CameraOff, Maximize2, Minimize2 } from 'lucide-react'

export function VideoInterface() {
  const [stream, setStream] = useState(null)
  const [cameraOn, setCameraOn] = useState(false)
  const [mainDisplay, setMainDisplay] = useState('user')
  const videoRef = useRef(null)

  useEffect(() => {
    if (cameraOn) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          setStream(stream)
          if (videoRef.current) {
            videoRef.current.srcObject = stream
          }
        })
        .catch(err => console.error("Error accessing the camera:", err))
    } else {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
      setStream(null)
    }
  }, [cameraOn])

  const toggleCamera = () => {
    setCameraOn(!cameraOn)
  }

  const switchDisplay = () => {
    setMainDisplay(mainDisplay === 'user' ? 'ai' : 'user')
  }

  
  return (
    <div className="flex flex-col items-center justify-center h-full bg-transparent text-white">
      <div className="relative w-full max-w-4xl aspect-video rounded-lg overflow-hidden">
        {mainDisplay === 'user' ? (
          cameraOn ? (
            <video ref={videoRef} autoPlay className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-700">
              <CameraOff className="w-24 h-24 text-gray-400" />
            </div>
          )
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-teal-500">
            <Avatar className="w-64 h-64">
              <AvatarImage src="/ai-avatar.png" alt="AI Avatar" />
              <AvatarFallback className="text-black">AI</AvatarFallback>
            </Avatar>
          </div>
        )}
        <div
          className="absolute bottom-4 right-4 w-48 h-32 rounded-lg overflow-hidden cursor-pointer"
          onClick={switchDisplay}>
          {mainDisplay === 'user' ? (
            <div className="w-full h-full flex items-center justify-center bg-teal-500">
              <Avatar className="w-16 h-16">
                <AvatarImage src="/ai-avatar.png" alt="AI Avatar" />
                <AvatarFallback className="text-black">AI</AvatarFallback>
              </Avatar>
            </div>
          ) : (
            cameraOn ? (
              <video ref={videoRef} autoPlay className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-700">
                <CameraOff className="w-8 h-8 text-gray-400" />
              </div>
            )
          )}
          {mainDisplay === 'user' ? (
            <Maximize2 className="absolute top-2 right-2 w-6 h-6 text-white opacity-75" />
          ) : (
            <Minimize2 className="absolute top-2 right-2 w-6 h-6 text-white opacity-75" />
          )}
        </div>
      </div>
      <div className="mt-4 space-x-4">
        <Button onClick={toggleCamera} variant={cameraOn ? "destructive" : "default"}>
          {cameraOn ? <CameraOff className="mr-2 h-4 w-4" /> : <Camera className="mr-2 h-4 w-4" />}
          {cameraOn ? "Turn Off Camera" : "Turn On Camera"}
        </Button>
      </div>
      </div>
  );

}
