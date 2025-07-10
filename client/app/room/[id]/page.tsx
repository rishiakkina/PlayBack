"use client";

import { Button } from "@/components/ui/button";
import { Volume2, MicOff, Monitor, MonitorOff } from "lucide-react";
import Image from "next/image";
import React, { useEffect } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { ChatCard } from "@/components/ChatCard"
import Link from "next/link";
import { usePeer } from "@/providers/peer";
import { useSocket, useScreenShareSignaling } from "@/providers/socket";
import { ScreenShareViewer } from "@/components/ScreenShareViewer";
import { useParams } from "next/navigation";

export default function RoomPage() {
  const params = useParams();
  const roomId = params.id as string;
  const { startScreenShare, stopScreenShare, isScreenSharing } = usePeer()!;
  const socket = useSocket();

  // Join room when component mounts
  useEffect(() => {
    if (socket && roomId) {
      socket.emit("join-room", roomId);
      console.log("Joined room:", roomId);
    }
  }, [socket, roomId]);

  const handleScreenShare = async () => {
    if (isScreenSharing) {
      stopScreenShare();
    } else {
      await startScreenShare();
    }
  };

  return (
    <div className="flex h-screen w-screen bg-muted">
      {/* Main Area */}
      <div className="flex flex-col flex-1 h-full">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
                <Image src="/playback-removebg-preview.png" alt="Logo" width={30} height={30} />
                <span className="font-bold text-xl text-black">PLAYBACK</span>
            </Link>
            <span className="ml-4 text-black/80 font-medium">Watch Party</span>
          </div>
        </header>

        {/* Content Area */}
        <ResizablePanelGroup direction="horizontal">
            <ResizablePanel minSize={70} defaultSize={70} className="flex flex-col">
                <ScreenShareViewer roomId={roomId} />
                <div className="flex items-center justify-between px-6 py-3 bg-white border-t border-zinc-800 h-[50px]">
                    <div className="flex items-center gap-2">
                        <Button variant="secondary" size="sm" className="flex items-center gap-2">
                        <Volume2 className="w-4 h-4" /> Unmute
                        </Button>
                        <span className="text-zinc-400 text-sm">DTLF</span>
                        <span className="text-xs text-zinc-500 ml-2">Just chatting</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button 
                            variant={isScreenSharing ? "destructive" : "outline"} 
                            size="sm" 
                            className="flex items-center gap-2"
                            onClick={handleScreenShare}
                        >
                            {isScreenSharing ? (
                                <>
                                    <MonitorOff className="w-4 h-4" /> Stop Sharing
                                </>
                            ) : (
                                <>
                                    <Monitor className="w-4 h-4" /> Share Screen
                                </>
                            )}
                        </Button>
                        <Button variant="outline" size="sm" className="flex items-center gap-2">
                            Stage <MicOff className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel minSize={20} defaultSize={30}>
                <ChatCard />
            </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
