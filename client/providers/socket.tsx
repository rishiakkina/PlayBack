"use client"

import { createContext, useContext, useMemo } from "react";
import { io, Socket } from "socket.io-client";

const SocketContext = createContext<Socket | null>(null);

export const useSocket = () => {
    const context = useContext(SocketContext);
    return context;
}

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const socket = useMemo(() => io("http://localhost:8080"), []);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    )
}

// Screen sharing signaling helpers
export const useScreenShareSignaling = () => {
    const socket = useSocket();
    
    const emitScreenShareStart = (roomId: string) => {
        socket?.emit('screen-share-start', roomId);
    };

    const emitScreenShareStop = (roomId: string) => {
        socket?.emit('screen-share-stop', roomId);
    };

    const emitScreenShareOffer = (roomId: string, offer: RTCSessionDescriptionInit) => {
        socket?.emit('screen-share-offer', { roomId, offer });
    };

    const emitScreenShareAnswer = (roomId: string, answer: RTCSessionDescriptionInit) => {
        socket?.emit('screen-share-answer', { roomId, answer });
    };

    const emitScreenShareIceCandidate = (roomId: string, candidate: RTCIceCandidateInit) => {
        socket?.emit('screen-share-ice-candidate', { roomId, candidate });
    };

    return {
        emitScreenShareStart,
        emitScreenShareStop,
        emitScreenShareOffer,
        emitScreenShareAnswer,
        emitScreenShareIceCandidate
    };
};