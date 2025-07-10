"use client"

import { createContext, useContext, useState } from "react";


type RoomIdContextType = {
    roomId: string | null,
    setRoomId: (roomId: string) => void
}

const RoomIdContext = createContext<RoomIdContextType | null>(null);


export const useRoomId = () => {
    const context = useContext(RoomIdContext);
    return context;
}

export const RoomIdProvider = ({ children }: { children: React.ReactNode }) => {
    const [roomId, setRoomId] = useState<string | null>(null);

    return (
        <RoomIdContext.Provider value={{roomId, setRoomId}}>
            {children}
        </RoomIdContext.Provider>
    )
}