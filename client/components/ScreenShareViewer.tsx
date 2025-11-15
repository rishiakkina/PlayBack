"use client";

import { useEffect, useRef } from "react";
import { usePeer } from "@/providers/peer";
import { MicOff } from "lucide-react";
 

export const ScreenShareViewer = ({ streamType }: {streamType: string}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const peerContext = usePeer();
    
    if (!peerContext) {
        return (
            <div className="h-full bg-white flex items-center justify-center relative overflow-hidden">
                <span className="text-zinc-400 text-lg">Loading...</span>
            </div>
        );
    }
    
    const { isStreaming, localStreamRef, remoteStreamRef, isMuted, remoteStream } = peerContext;

    useEffect(() => {
        console.log("ScreenShareViewer - Stream state:", {
            isStreaming,
            hasShareStream: !!localStreamRef.current,
            hasRemoteStream: !!remoteStreamRef.current,
            remoteStreamTracks: remoteStreamRef.current?.getTracks().length || 0
        });
        
        if (videoRef.current) {
            console.log("Setting video source");
            // Prioritize remote stream (what other users are sharing)
            if (streamType === "remote") {
                videoRef.current.srcObject = remoteStreamRef.current;
            } else if (streamType === "local") {
                videoRef.current.srcObject = localStreamRef.current;
            } else {
                videoRef.current.srcObject = null;
            }
        }
    }, [localStreamRef.current, remoteStreamRef.current, remoteStream]);

    // Check if we have any active streams
    const hasActiveStream = streamType === "remote" ? !!remoteStreamRef.current : !!localStreamRef.current;

    if (!hasActiveStream) {
        return (
            <div className="h-full bg-white flex items-center justify-center relative overflow-hidden w-full">
                <span className="text-zinc-400 text-lg">No Stream</span>    
            </div>
        );
    }

    return (
        <div className="h-full bg-black flex items-center justify-center relative overflow-hidden">
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted={streamType === "local"}   // Mute local stream to avoid feedback
                className="w-full h-full object-contain"
                onLoadedMetadata={() => {
                    if (videoRef.current) {
                        console.log("Video metadata loaded, playing video");
                        videoRef.current.play().catch(error => {
                            console.error("Error playing video:", error);
                        });
                    }
                }}
                onCanPlay={() => {
                    console.log("Video can play");
                }}
                onError={(e) => {
                    console.error("Video error:", e);
                }}
                onEnded={() => {
                    console.log("Video ended");
                    if (videoRef.current) {
                        videoRef.current.srcObject = null;
                    }
                }}
            />
            <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded text-sm flex items-center gap-1">
                {streamType === "remote" ? "Remote Screen Share" : "Local Screen Share"}
                {isMuted ? <MicOff className="w-4 h-4" /> : ""}
            </div>
        </div>
    );
}; 