"use client"

import { createContext, useContext, useMemo } from "react";
import { io, Socket } from "socket.io-client";

const SocketContext = createContext<Socket | null>(null);

export const useSocket = () => {
    const context = useContext(SocketContext);
    return context;
}

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const socket = useMemo(() => io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"), []);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    )
}
