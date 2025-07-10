"use client";

import { useEffect, useRef } from "react";
import { usePeer } from "@/providers/peer";
import { useScreenShareMesh } from "@/lib/useScreenShareMesh";

interface ScreenShareViewerProps {
    roomId: string;
}

export const ScreenShareViewer = ({ roomId }: ScreenShareViewerProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const { isScreenSharing, screenShareStream } = usePeer()!;
    const { firstRemoteStream } = useScreenShareMesh(roomId, screenShareStream, isScreenSharing);

    useEffect(() => {
        if (videoRef.current) {
            if (isScreenSharing && screenShareStream) {
                videoRef.current.srcObject = screenShareStream;
            } else if (firstRemoteStream) {
                videoRef.current.srcObject = firstRemoteStream;
            } else {
                // Clear the video element when no streams are available
                videoRef.current.srcObject = null;
            }
        }
    }, [isScreenSharing, screenShareStream, firstRemoteStream]);

    // Check if we have any active streams
    const hasActiveStream = isScreenSharing || firstRemoteStream;

    if (!hasActiveStream) {
        return (
            <div className="h-full bg-white flex items-center justify-center relative overflow-hidden">
                <span className="text-zinc-400 text-lg">[ Video/Game Stream Placeholder ]</span>
            </div>
        );
    }

    return (
        <div className="h-full bg-black flex items-center justify-center relative overflow-hidden">
            <video
                ref={videoRef}
                autoPlay
                playsInline
                className="max-w-full max-h-full object-contain"
                onLoadedMetadata={() => {
                    if (videoRef.current) {
                        videoRef.current.play();
                    }
                }}
                onEnded={() => {
                    // Handle when video ends
                    if (videoRef.current) {
                        videoRef.current.srcObject = null;
                    }
                }}
            />
            <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded text-sm">
                Screen Share Active
            </div>
        </div>
    );
}; 