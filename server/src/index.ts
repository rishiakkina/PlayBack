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
        socket.join(roomId);
        if (!roomUsers[roomId]) roomUsers[roomId] = new Set();
        roomUsers[roomId].add(socket.id);
        console.log("User joined the room", roomId);
        io.to(roomId).emit("joining-msg","A new user joined the room", roomId);
        // Send the list of users in the room to the new user
        socket.emit("users-in-room", Array.from(roomUsers[roomId]));
        // Notify others of the new user
        socket.to(roomId).emit("user-joined", socket.id);
    })

    socket.on("get-users-in-room", (roomId) => {
        socket.emit("users-in-room", Array.from(roomUsers[roomId] || []));
    });

    socket.on("send-msg", (msg, roomId) => {
        console.log("Message sent to room", roomId);
        socket.to(roomId).emit("recieve-msg", msg);
    })

    // Screen sharing events (now directed)
    socket.on("screen-share-offer", ({ targetId, offer }) => {
        io.to(targetId).emit("screen-share-offer", { offer, from: socket.id });
    });

    socket.on("screen-share-answer", ({ targetId, answer }) => {
        io.to(targetId).emit("screen-share-answer", { answer, from: socket.id });
    });

    socket.on("screen-share-ice-candidate", ({ targetId, candidate }) => {
        io.to(targetId).emit("screen-share-ice-candidate", { candidate, from: socket.id });
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