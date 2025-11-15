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
import { useRouter } from "next/navigation";
import { useSocket } from "../providers/socket";
const axios = require("axios").default;

export function CreateRoom() {
  const socket = useSocket();
  const [roomId, setRoomId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function createRoom(e: React.FormEvent) {
    e.preventDefault();
    
    // Validation
    if (!roomId.trim()) {
      alert("Please enter a room name");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/create-room`, { 
        roomName: roomId,
        roomId: roomId,
      });
      
      console.log(response.data);
      
      if (response.data.success) {
        router.push(`/room/${roomId}`);
      } else {
        console.log(response.data.error);
        alert(response.data.error || "Failed to create room");
      }
    } catch (error) {
      console.error("Error creating room:", error);
      alert(error || "Failed to create room");
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
            Enter Room name here. Click create when you&apos;re
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
