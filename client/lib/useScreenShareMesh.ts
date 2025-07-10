import { useEffect, useRef, useState, useCallback } from "react";
import { useSocket } from "@/providers/socket";

export type PeerMap = { [socketId: string]: RTCPeerConnection };

export function useScreenShareMesh(roomId: string, localScreenStream: MediaStream | null, isScreenSharing: boolean) {
    const socket = useSocket();
    const [peers, setPeers] = useState<PeerMap>({});
    const [remoteStreams, setRemoteStreams] = useState<{ [socketId: string]: MediaStream }>({});
    const [userId, setUserId] = useState<string | null>(null);
    const peersRef = useRef<PeerMap>({});

    // Helper to create a new peer connection
    const createPeerConnection = useCallback((targetId: string) => {
        // Only create peer connection on client side
        if (typeof window === 'undefined' || typeof RTCPeerConnection === 'undefined') {
            return null;
        }

        const pc = new RTCPeerConnection({
            iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }]
        });

        // Add local screen share tracks if sharing
        if (isScreenSharing && localScreenStream) {
            localScreenStream.getTracks().forEach(track => {
                pc.addTrack(track, localScreenStream);
            });
        }

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socket?.emit("screen-share-ice-candidate", {
                    targetId,
                    candidate: event.candidate
                });
            }
        };

        pc.ontrack = (event) => {
            if (event.streams && event.streams[0]) {
                setRemoteStreams(prev => ({ ...prev, [targetId]: event.streams[0] }));
                
                // Monitor the tracks for when they end
                event.track.onended = () => {
                    setRemoteStreams(prev => {
                        const newStreams = { ...prev };
                        delete newStreams[targetId];
                        return newStreams;
                    });
                };
            }
        };

        // Handle connection state changes
        pc.onconnectionstatechange = () => {
            if (pc.connectionState === 'closed' || pc.connectionState === 'failed') {
                // Remove the peer from our state
                delete peersRef.current[targetId];
                setPeers(prev => {
                    const newPeers = { ...prev };
                    delete newPeers[targetId];
                    return newPeers;
                });
                setRemoteStreams(prev => {
                    const newStreams = { ...prev };
                    delete newStreams[targetId];
                    return newStreams;
                });
            }
        };

        peersRef.current[targetId] = pc;
        setPeers(prev => ({ ...prev, [targetId]: pc }));
        return pc;
    }, [socket, isScreenSharing, localScreenStream]);

    // Handle signaling
    useEffect(() => {
        if (!socket || typeof window === 'undefined') return;

        // Get our own socket ID
        setUserId(socket.id || null);

        // Handle users in room
        socket.on("users-in-room", (users: string[]) => {
            users.forEach((id) => {
                if (id !== socket.id && !peersRef.current[id]) {
                    createPeerConnection(id);
                }
            });
        });

        // Handle new user join
        socket.on("user-joined", (id: string) => {
            if (id !== socket.id && !peersRef.current[id]) {
                createPeerConnection(id);
            }
        });

        // Handle user leave
        socket.on("user-left", (id: string) => {
            if (peersRef.current[id]) {
                peersRef.current[id].close();
                delete peersRef.current[id];
                setPeers(prev => {
                    const newPeers = { ...prev };
                    delete newPeers[id];
                    return newPeers;
                });
                setRemoteStreams(prev => {
                    const newStreams = { ...prev };
                    delete newStreams[id];
                    return newStreams;
                });
            }
        });

        // Handle offer
        socket.on("screen-share-offer", async ({ offer, from }) => {
            let pc: RTCPeerConnection | null = peersRef.current[from];
            if (!pc) {
                pc = createPeerConnection(from);
            }
            if (pc) {
                await pc.setRemoteDescription(new RTCSessionDescription(offer));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                socket.emit("screen-share-answer", { targetId: from, answer });
            }
        });

        // Handle answer
        socket.on("screen-share-answer", async ({ answer, from }) => {
            const pc = peersRef.current[from];
            if (pc) {
                await pc.setRemoteDescription(new RTCSessionDescription(answer));
            }
        });

        // Handle ICE candidate
        socket.on("screen-share-ice-candidate", async ({ candidate, from }) => {
            const pc = peersRef.current[from];
            if (pc) {
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
            }
        });

        // Request users in room on mount
        socket.emit("get-users-in-room", roomId);

        return () => {
            socket.off("users-in-room");
            socket.off("user-joined");
            socket.off("user-left");
            socket.off("screen-share-offer");
            socket.off("screen-share-answer");
            socket.off("screen-share-ice-candidate");
        };
    }, [socket, roomId, createPeerConnection]);

    // When starting screen share, add tracks to all peers and renegotiate
    useEffect(() => {
        if (!isScreenSharing || !localScreenStream || typeof window === 'undefined') return;
        Object.entries(peersRef.current).forEach(([id, pc]) => {
            localScreenStream.getTracks().forEach(track => {
                pc.addTrack(track, localScreenStream);
            });
            pc.createOffer().then(offer => {
                pc.setLocalDescription(offer);
                socket?.emit("screen-share-offer", { targetId: id, offer });
            });
        });
    }, [isScreenSharing, localScreenStream, socket]);

    // When stopping screen share, remove tracks from all peers
    useEffect(() => {
        if (isScreenSharing || typeof window === 'undefined') return;
        Object.values(peersRef.current).forEach(pc => {
            pc.getSenders().forEach(sender => {
                if (sender.track && sender.track.kind === "video") {
                    pc.removeTrack(sender);
                }
            });
        });
    }, [isScreenSharing]);

    // Return the first available remote stream (for display)
    const firstRemoteStream = Object.values(remoteStreams)[0] || null;

    return {
        peers,
        remoteStreams,
        firstRemoteStream,
        userId,
    };
} 