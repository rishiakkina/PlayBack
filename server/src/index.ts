import express, { Request, Response, RequestHandler } from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
const server = createServer(app);

const io = new Server(server, {
    cors : {
        origin : "http://localhost:3000"
    }
})

app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000' }));

type room = {
    roomName : string,
    roomId : string,
    password : string
}

const rooms : room[] = []
const roomUsers: { [roomId: string]: Set<string> } = {};

// Socket connection handling
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
    
    socket.on("join-room",(roomId : string) => {
        console.log(`User ${socket.id} joining room: ${roomId}`);
        socket.join(roomId);
        if (!roomUsers[roomId]) roomUsers[roomId] = new Set();
        roomUsers[roomId].add(socket.id);
        console.log("User joined the room", roomId);
        
        // Send list of existing users to the new joiner
        const existingUsers = Array.from(roomUsers[roomId]).filter(id => id !== socket.id);
        socket.emit("users-in-room", existingUsers);
        
        // Notify everyone in the room about the new user
        io.to(roomId).emit("user-joined", socket.id);
    })

    socket.on("send-msg", (msg, roomId) => {
        console.log("Message sent to room", roomId);
        socket.to(roomId).emit("recieve-msg", msg);
    })

    socket.on("offer", ({ offer, roomId }) => {
        console.log(`Offer received from ${socket.id} for room ${roomId}`);
        if (!roomId) {
            console.error("RoomId is undefined in offer from", socket.id);
            return;
        }
        // Broadcast to all users in the room except sender
        socket.to(roomId).emit("offer", { offer, from: socket.id });
        console.log(`Offer broadcasted to room ${roomId}`);
    });

    socket.on("answer", ({ answer, roomId }) => {
        console.log(`Answer received from ${socket.id} for room ${roomId}`);
        if (!roomId) {
            console.error("RoomId is undefined in answer from", socket.id);
            return;
        }
        // Broadcast to all users in the room except sender
        socket.to(roomId).emit("answer", { answer, from: socket.id });
        console.log(`Answer broadcasted to room ${roomId}`);
    });

    socket.on("ice-candidate", ({ candidate, roomId }) => {
        console.log(`ICE candidate received from ${socket.id} for room ${roomId}`);
        if (!roomId) {
            console.error("RoomId is undefined in ICE candidate from", socket.id);
            return;
        }
        // Broadcast to all users in the room except sender
        socket.to(roomId).emit("ice-candidate", { candidate, from: socket.id });
        console.log(`ICE candidate broadcasted to room ${roomId}`);
    });

    socket.on("disconnecting", () => {
        for (const roomId of socket.rooms) {
            if (roomUsers[roomId]) {
                roomUsers[roomId].delete(socket.id);
                socket.to(roomId).emit("user-left", socket.id);
            }
        }
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
})

app.get("/" , (req,res) => {
    res.status(200).json("hi hello")
})
app.post("/create-room", (req,res) => {
    const { roomName, roomId, password } = req.body;
    
    // Check if room already exists
    const existingRoom = rooms.find(room => room.roomId === roomId);
    if (existingRoom) {
        res.status(400).json({ error: "Room already exists" });
        console.log("Room already exists");
    } else {
        // Create new room
        const newRoom = {
            roomName,
            roomId,
            password
        };
        
        rooms.push(newRoom);

        console.log(`Room created: ${roomName} (${roomId})`);
        res.status(201).json({ 
            success: true, 
            room: newRoom,
            message: "Room created successfully"
        });
    }
})

app.post("/join-room", (req,res) => {
    const room = req.body;
    const roomId  = room.roomId;
    const password : string | null = room.password;

    // Check if room exists and password is correct
    const existingRoom = rooms.find(room => room.roomId === roomId && room.password === password);
    if (existingRoom) {
        console.log(`Someone joined the room ${roomId}`);
        res.status(200).json({
            success : true,
            msg : "Room joined successfully"
        })
    } else {
        res.status(400).json({ error: "Room doesn't exists" });
    }
})

server.listen(8080, () => {
  console.log("Socket server connected to port 8080");
});