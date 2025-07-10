"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useSocket } from "../providers/socket";
import { Socket } from "socket.io-client";
import { useRoomId } from "../providers/roomId";
export function JoinRoom(props: React.PropsWithChildren<{}>) {
  const {roomId, setRoomId} = useRoomId() as {roomId: string, setRoomId: (roomId: string) => void}
  const [password, setPassword] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const Socket = useSocket() as Socket | null;
  async function joinRoom(e: React.FormEvent) { 
    e.preventDefault();

    if(!roomId.trim()){
      alert("Please enter a room id")
      return
    }

    if(isPrivate && !password.trim()){
      alert("Please enter a password")
      return
    }

    setIsLoading(true)

    try {
      const response = await axios.post("http://localhost:8080/join-room", {
        roomId: roomId,
        password: password
      })
      console.log(response.data)


      if(response.data.success){
        Socket?.emit("join-room", roomId);
        setRoomId(roomId);
        router.push(`/room/${roomId}`);
      }else{
        alert(response.data.error || "Failed to join room")
      }
    } catch (error: any) {
      console.error("Error joining room:", error);
      alert(error.message || "Failed to join room");
    }finally{
      setIsLoading(false);
    }
    
  }


  return (
    <Dialog>
        <DialogTrigger asChild>
            <Button variant="outline" className="px-7 py-3 font-semibold">Join a Room</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={joinRoom}>
          <DialogHeader>
            <DialogTitle>Join a Room</DialogTitle>
            <DialogDescription>
            Enter RoomId and password here. Click join when you&apos;re
            done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-3">
              <Label htmlFor="name-1">Room name</Label>
              <Input value={roomId} onChange={(e) => setRoomId(e.target.value)}/>
            </div>
            <div className="grid gap-3">
                <Label htmlFor="password">Password</Label>
                <Input type="password" placeholder="•••••••" value={password} onChange={(e) => setPassword(e.target.value)}/>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Joining..." : "Join"}
            </Button>
          </DialogFooter>
          </form>
        </DialogContent>
    </Dialog>
  )
}
