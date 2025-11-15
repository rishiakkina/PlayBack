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

export function JoinRoom() {
  const [roomId, setRoomId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const socket = useSocket();
  async function joinRoom(e: React.FormEvent) { 
    e.preventDefault();

    if(!roomId.trim()){
      alert("Please enter a room id")
      return
    }

    setIsLoading(true)

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/join-room`, {
        roomId: roomId
      })
      console.log(response.data)


      if(response.data.success){
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
            Enter RoomId here. Click join when you&apos;re done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
          <div className="grid gap-3">
            <Label htmlFor="name">Room name</Label>
            <Input 
              id="name"
              value={roomId} 
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="Enter room name"
              required
            />
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
