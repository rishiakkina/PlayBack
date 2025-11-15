"use client";

import { Button } from "@/components/ui/button";
import { Mic, MicOff, Monitor, MonitorOff, Camera, CameraOff } from "lucide-react";
import Image from "next/image";
import React, { useEffect } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { ChatCard } from "@/components/ChatCard"
import Link from "next/link";
import { usePeer } from "@/providers/peer";
import { useSocket } from "@/providers/socket";
import { ScreenShareViewer } from "@/components/ScreenShareViewer";
import { useParams } from "next/navigation";

export default function RoomPage() {
  const params = useParams();
  const roomId = params.id as string;
  const peerContext = usePeer();
  const socket = useSocket();
  
  console.log("RoomId:", roomId, "socket:", socket?.id);
  
  // Early return if context is not available
  if (!peerContext) {
    return <div>Loading...</div>;
  }
  
  const { startScreenShare, stopScreenShare, startVideoShare, stopVideoShare, mute, unmute, isStreaming, isMuted, createOffer, connect, started, setStarted } = peerContext;
  
  // Join room when component mounts  
  useEffect(() => {
    if (socket && roomId) {
      socket.emit("join-room", roomId);
      
      console.log("Joined room:", roomId);
    } else {
      console.log("Cannot join room - socket:", !!socket, "roomId:", roomId);
    }
  }, [socket, roomId]);

  const handleScreenShare = async () => {
    if (isStreaming) {
      stopScreenShare();
    } else {
      await startScreenShare(); 
    }
  };

  const handleVideoShare = async () => {
    if (isStreaming) {
      console.log("Stopping video share");
      stopVideoShare();
    } else {
      console.log("Starting video share");
      await startVideoShare();
    }
  };

  const handleMute = async () => {
    console.log("Handle mute clicked");
    if (isMuted) {
      unmute();
    } else {
      mute();
    }
  };

  return (
    <div className="flex h-screen w-screen bg-muted ">
      {/* Main Area */}
      <div className="flex flex-col flex-1 h-full">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
                <Image src="/playback-removebg-preview.png" alt="Logo" width={30} height={30} />
                <span className="font-bold text-xl text-black">PLAYBACK</span>
            </Link>
            <span className="ml-4 text-black/80 font-medium">{roomId}</span>
          </div>
        </header>

        {/* Content Area */}
        <ResizablePanelGroup direction="horizontal">
            <ResizablePanel minSize={70} defaultSize={70} className="flex flex-col ">
                <div className="flex flex-row h-full w-full relative">
                    <ScreenShareViewer streamType="remote" />
                    <div className="absolute bottom-4 right-4 w-64 h-48 bg-black rounded-lg shadow-lg border-2 border-gray-300 overflow-hidden z-50">
                    <ScreenShareViewer streamType="local" />
                </div>
                </div>
                <div className="flex items-center justify-between px-6 py-3 bg-white border-t border-zinc-800 h-[50px]">
                    <div className="flex items-center gap-2">
                        <Button 
                            variant={isMuted ? "destructive" : "secondary"} 
                            size="sm" 
                            disabled={!started}
                            className="flex items-center gap-2"
                            onClick={handleMute}
                        >
                            {isMuted ? (
                                <>
                                    <MicOff className="w-4 h-4" /> Mute
                                </>
                            ) : (
                                <>
                                    <Mic className="w-4 h-4" /> Unmute
                                </>
                            )}
                        </Button>
                        <Button 
                            variant={isStreaming ? "destructive" : "secondary"} 
                            size="sm" 
                            disabled={!started}
                            className="flex items-center gap-2"
                            onClick={handleVideoShare}
                        >
                            {isStreaming ? (
                                <>
                                    <CameraOff className="w-4 h-4" /> Camera Off
                                </>
                            ) : (
                                <>
                                    <Camera className="w-4 h-4" /> Camera On
                                </>
                            )}
                        </Button>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button 
                            variant={isStreaming ? "destructive" : "secondary"} 
                            disabled={!started}
                            size="sm" 
                            className="flex items-center gap-2"
                            onClick={handleScreenShare}
                        >
                            {isStreaming ? (
                                <>
                                    <MonitorOff className="w-4 h-4" /> Stop Sharing
                                </>
                            ) : (
                                <>
                                    <Monitor className="w-4 h-4" /> Share Screen
                                </>
                            )}
                        </Button>
                        <Button 
                            variant="secondary"
                            size="sm" 
                            disabled={isStreaming || started}
                            className="flex items-center gap-2"
                            onClick={() => {
                                connect();
                            }}
                        >
                            <span>Start</span>
                        </Button>
                    </div>
                </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel minSize={20} defaultSize={30}>
                <ChatCard roomId={roomId} />
            </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
