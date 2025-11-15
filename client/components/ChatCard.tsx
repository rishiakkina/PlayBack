"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SendHorizonal } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import clsx from "clsx"
import { useSocket } from "../providers/socket"

type Message = {
  text: string
  sender: "user" | "bot"
}

export function ChatCard({roomId}: {roomId: string}) {
  const socket = useSocket();

  const [messages, setMessages] = useState<Message[]>([
    { text: "Hi, how can I help you today?", sender: "bot" },
    { text: "Hey, I'm having trouble with my account.", sender: "user" },
    { text: "What seems to be the the problem?", sender: "bot" },
    { text: "I can't log in.", sender: "user" },
  ])

  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    if(!socket) return;
    socket.on("recieve-msg", (msg) => { 
      console.log("Message received from server", msg);
      setMessages((prev) => [...prev, { text : msg, sender : "user"}])
      bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    })
  }, [socket])

  const sendMessage = () => {
    if (!input.trim()) return

    setMessages((prev) => [...prev, { text: input, sender: "user" }])
    socket?.emit("send-msg", input, roomId)
    setInput("")
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className=" w-full bg-white h-full text-black shadow-md border-l border-zinc-800 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between p-2 border-b border-zinc-800">
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>SD</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">Sofia Davis</p>
            <p className="text-xs text-muted-foreground">m@example.com</p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 space-y-2 h-[calc(100vh-200px)]">
        <div className="p-4">
            {messages.map((message,idx) => (
                <div
                key={idx}
                className={clsx(
                "w-fit px-4 py-2 my-4 rounded-xl text-sm bg-zinc-200 text-black ml-auto self-end"
                )}
            >
                {message.text}
            </div>
            ))}
        </div>
        <div ref={bottomRef} />
      </ScrollArea>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          sendMessage()
        }}
        className="flex items-center gap-2 p-3 border-t border-zinc-800 bg-white h-[50px]"
      >
        <Input
          className="bg-white border-zinc-700 text-black placeholder:text-zinc-400"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <Button type="submit" size="icon" className="bg-zinc-100 text-black border border-zinc-700 hover:text-zinc-100">
          <SendHorizonal className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}
