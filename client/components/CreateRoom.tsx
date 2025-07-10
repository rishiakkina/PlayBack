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
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSocket } from "../providers/socket";
const axios = require("axios").default;
import { Socket } from "socket.io-client";
import { useRoomId } from "../providers/roomId";

export function CreateRoom() {
  const Socket = useSocket() as Socket | null;
  const {roomId, setRoomId} = useRoomId() as {roomId: string, setRoomId: (roomId: string) => void};
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function createRoom(e: React.FormEvent) {
    e.preventDefault();
    
    // Validation
    if (!roomId.trim()) {
      alert("Please enter a room name");
      return;
    }
    
    if (isPrivate && !password.trim()) {
      alert("Please enter a password for private room");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await axios.post("http://localhost:8080/create-room", { 
        roomName: roomId,
        roomId: roomId,
        password: password || ""
      });
      
      console.log(response.data);
      
      if (response.data.success) {
        router.push(`/room/${roomId}`);
        // Join the room via socket
        Socket?.emit("join-room", roomId);
      } else {
        console.log(response.data.error);
        alert(response.data.error || "Failed to create room");
      }
    } catch (error: any) {
      console.error("Error creating room:", error);
      alert(error.response?.data?.error || "Failed to create room");
    } finally {
      setIsLoading(false);
    }
  }
  
  return (
    <Dialog>
      <DialogTrigger asChild>
          <Button className="px-7 py-3 font-semibold">Create a Room</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={createRoom}>
        <DialogHeader>
          <DialogTitle>Create a Room</DialogTitle>
          <DialogDescription>
            Enter Room name and password here. Click create when you&apos;re
            done.
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
          <div className="flex items-center space-x-2 ">
              <Switch id="private" checked={isPrivate} onCheckedChange={setIsPrivate}/>
              <Label htmlFor="private">Private Room</Label>
          </div>
          {isPrivate && (
              <div className="grid gap-3">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    type="password"
                    placeholder="•••••••" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    required={isPrivate}
                  />
              </div>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
