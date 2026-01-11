"use client"
import { createContext, useContext, useMemo, useState, useEffect, useCallback, useRef } from "react";
import { useSocket } from "./socket";
import { useParams } from "next/navigation";

const PeerContext = createContext<PeerContextType | null>(null);

type PeerContextType = {
    peer: RTCPeerConnection | null;
    createOffer: () => Promise<void>;
    startScreenShare: () => Promise<MediaStream | null>;
    stopScreenShare: () => void;
    isStreaming: boolean;
    localStreamRef: React.RefObject<MediaStream | null>;
    startVideoShare: () => Promise<MediaStream | null>;
    stopVideoShare: () => void;
    isMuted: boolean;
    mute: () => void;
    unmute: () => void;
    remoteStreamRef: React.RefObject<MediaStream | null>;
    connect: () => Promise<void>;
    remoteStream: MediaStream | null;
    started: boolean;
    setStarted: (started: boolean) => void;
}

export const usePeer = () => useContext(PeerContext);

const servers = {
    iceServers:[
        {
            urls:["stun:stun.l.google.com:19302"]
        }
    ]
}

export const PeerProvider = ({ children }: { children: React.ReactNode }) => {

    const socket = useSocket();
    const params = useParams();
    const roomId = params.id as string; 
    const [isMuted, setIsMuted] = useState(false);
    const [started, setStarted] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const localStreamRef = useRef<MediaStream | null>(null);
    const remoteStreamRef = useRef<MediaStream | null>(null);
    const peerRef = useRef<RTCPeerConnection | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

    const createPeerConnection = useCallback(async () => {
        peerRef.current = new RTCPeerConnection(servers);

        if(!peerRef.current) throw new Error("Peer connection not available");

        peerRef.current.onicecandidate = (e) => {
          if (e.candidate) {
            socket?.emit("ice-candidate", {candidate: e.candidate, roomId});
          }
        };
    
        peerRef.current.ontrack = (e) => {
            console.log("Received remote track:", e.streams[0]);
            remoteStreamRef.current = e.streams[0];
            setRemoteStream(e.streams[0]);
        };

        if (localStreamRef.current) {
            console.log("Adding existing local tracks to peer connection");
            localStreamRef.current.getTracks().forEach(track => {
                peerRef.current?.addTrack(track, localStreamRef.current as MediaStream);
            });
        }

        if(localStreamRef.current) {
            setIsStreaming(true);
        }
        setStarted(true);
    }, [socket]);

    const createOffer = useCallback(async () => {
        try {
            console.log("Creating offer for room:", roomId);
            await createPeerConnection();
            
            let offer = await peerRef.current?.createOffer();
            await peerRef.current?.setLocalDescription(offer);

            console.log("Offer created:", offer);
            socket?.emit("offer", { offer, roomId });
        } catch (error) {
            console.error("Error creating offer:", error);
        }
    }, [roomId, socket, createPeerConnection]);

    const handleOffer = useCallback(async ({ offer, from }: { offer: RTCSessionDescriptionInit, from: string }) => {
        try {
            if(!peerRef.current){
                console.log("Peer connection not available");
                return;
            }
            await createPeerConnection();
            
            await peerRef.current.setRemoteDescription(offer);
            let answer = await peerRef.current.createAnswer();
            await peerRef.current.setLocalDescription(answer);

            socket?.emit("answer", { answer, roomId });
        } catch (error) {
            console.error("Error handling offer:", error);
        }
    }, [roomId, socket, createPeerConnection]);

    const handleAnswer = useCallback(async ({ answer, from }: { answer: RTCSessionDescriptionInit, from: string }) => {
        console.log("Received answer from:", from);
        
        const currentPeer = peerRef.current;
        if (!currentPeer) {
            console.log("No peer connection available for answer");
            return;
        }
        try {
            await currentPeer.setRemoteDescription(answer);
        } catch (error) {
            console.error("Error setting remote description:", error);
        }
    }, [socket]);

    const handleIce = useCallback(async ({ candidate, from }: { candidate: RTCIceCandidateInit, from: string }) => {

        if (!peerRef.current) {
            console.log("No peer connection available for ICE candidate");
            return;
        }
        
        try {
            await peerRef.current.addIceCandidate(candidate);
        } catch (error) {
            console.error("Error adding ICE candidate:", error);
        }
    }, [socket]);

    const startScreenShare = async (): Promise<MediaStream | null> => {
        const currentPeer = peerRef.current;
        if (!currentPeer) throw new Error("Peer connection not available");
        try {
            localStreamRef.current = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    width: { ideal: 1920, min: 1280 },
                    height: { ideal: 1080, min: 720 },
                    frameRate: { ideal: 30, min: 15 }
                },
                audio: true
            });

            localStreamRef.current.getTracks().forEach((track) => {
                currentPeer.addTrack(track, localStreamRef.current as MediaStream);
            });

            setIsStreaming(true);

            await createOffer();

            return localStreamRef.current;
        } catch (error) {
            console.error("Error starting screen share:", error);
            return null;
        }
    };

    const startVideoShare = async (): Promise<MediaStream | null> => {
        const currentPeer = peerRef.current;
        if (!currentPeer) throw new Error("Peer connection not available");
        try {
            localStreamRef.current = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1920, min: 1280 },
                    height: { ideal: 1080, min: 720 },
                    frameRate: { ideal: 30, min: 15 }
                },
                audio: isMuted ? false : true
            });

            localStreamRef.current.getTracks().forEach(track => {
                currentPeer.addTrack(track, localStreamRef.current as MediaStream);
            });

            await createOffer();

            setIsStreaming(true);   

            return localStreamRef.current;
        } catch (error) {
            console.error('Error starting video share:', error);
            return null;
        }
    }

    const connect = async () => {
        localStreamRef.current = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 1920, min: 1280 },
                height: { ideal: 1080, min: 720 },
                frameRate: { ideal: 30, min: 15 }
            },
            audio: isMuted ? false : true
        });
        createOffer();
    }

    const stopScreenShare = () => {
        const currentPeer = peerRef.current;
        if (localStreamRef.current && currentPeer) {
            localStreamRef.current.getTracks().forEach(track => {
                track.stop();
                const sender = currentPeer.getSenders().find(sender => sender.track === track);
                if (sender) {
                    currentPeer.removeTrack(sender);
                }
            });
            localStreamRef.current = null;
            setIsStreaming(false);
        }
    };

    const stopVideoShare = () => {
        const currentPeer = peerRef.current;
        if (localStreamRef.current && currentPeer) {
            localStreamRef.current.getTracks().forEach(track => {
                track.stop();
                const sender = currentPeer.getSenders().find(sender => sender.track === track);
                if (sender) {
                    currentPeer.removeTrack(sender);
                }
            });
            localStreamRef.current = null;
            setIsStreaming(false);
        }
    };

    const mute = () => {
        const currentPeer = peerRef.current;
        if (currentPeer) {
            currentPeer.getSenders().forEach(sender => {
                if (sender.track?.kind === 'audio') {
                    sender.track.enabled = false;
                }
            });
            setIsMuted(true);
        }
    };

    const unmute = () => {
        const currentPeer = peerRef.current;
        if (currentPeer) {
            currentPeer.getSenders().forEach(sender => {
                if (sender.track?.kind === 'audio') {
                    sender.track.enabled = true;
                }
            });
            setIsMuted(false);
        }
    };

    // Wiring up signalling listeners once socket is ready
    useEffect(() => {
        if (!socket) return;
        
        socket.on("offer", handleOffer);
        socket.on("answer", handleAnswer);
        socket.on("ice-candidate", handleIce);
        
        return () => {
            socket.off("offer", handleOffer);
            socket.off("answer", handleAnswer);
            socket.off("ice-candidate", handleIce);
        };
    }, [socket, handleOffer, handleAnswer, handleIce]);


    return (
        <PeerContext.Provider value={{
            peer: peerRef.current, 
            createOffer, 
            startScreenShare, 
            stopScreenShare, 
            isStreaming, 
            localStreamRef,
            startVideoShare,
            stopVideoShare,
            isMuted,
            mute,
            unmute,
            remoteStreamRef,
            connect,
            remoteStream,
            started,
            setStarted
        }}>
            {children}
        </PeerContext.Provider>
    )
}