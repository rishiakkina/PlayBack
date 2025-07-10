"use client"
import { createContext, useContext, useMemo, useState, useEffect } from "react";

const PeerContext = createContext<PeerContextType | null>(null);

type PeerContextType = {
    peer: RTCPeerConnection | null;
    createOffer: () => Promise<RTCSessionDescriptionInit>;
    startScreenShare: () => Promise<MediaStream | null>;
    stopScreenShare: () => void;
    isScreenSharing: boolean;
    screenShareStream: MediaStream | null;
}

export const usePeer = () => useContext(PeerContext);

export const PeerProvider = ({ children }: { children: React.ReactNode }) => {
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [screenShareStream, setScreenShareStream] = useState<MediaStream | null>(null);
    const [peer, setPeer] = useState<RTCPeerConnection | null>(null);

    // Create peer connection only on client side
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const newPeer = new RTCPeerConnection({
                iceServers: [
                    {
                        urls: ["stun:stun.l.google.com:19302"]
                    }
                ]
            });
            setPeer(newPeer);
        }
    }, []);

    const createOffer = async () => {
        if (!peer) throw new Error("Peer connection not available");
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        return offer;
    }

    const startScreenShare = async (): Promise<MediaStream | null> => {
        if (!peer) throw new Error("Peer connection not available");
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: true
            });

            // Add screen share track to peer connection
            stream.getTracks().forEach(track => {
                peer.addTrack(track, stream);
            });

            setScreenShareStream(stream);
            setIsScreenSharing(true);

            // Handle stream ending (user stops sharing)
            stream.getVideoTracks()[0].onended = () => {
                stopScreenShare();
            };

            return stream;
        } catch (error) {
            console.error('Error starting screen share:', error);
            return null;
        }
    };

    const stopScreenShare = () => {
        if (screenShareStream && peer) {
            screenShareStream.getTracks().forEach(track => {
                track.stop();
                const sender = peer.getSenders().find(sender => sender.track === track);
                if (sender) {
                    peer.removeTrack(sender);
                }
            });
            setScreenShareStream(null);
            setIsScreenSharing(false);
        }
    };

    return (
        <PeerContext.Provider value={{
            peer, 
            createOffer, 
            startScreenShare, 
            stopScreenShare, 
            isScreenSharing, 
            screenShareStream
        }}>
            {children}
        </PeerContext.Provider>
    )
}