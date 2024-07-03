import express from "express";
import {createServer} from "http";
import {Server} from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import dotenv from "dotenv";

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const server = createServer(app);

// app.use(express.static(path.join(__dirname, '..', 'client')));

// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, '..', 'client', 'index.html'));
// });

const io = new Server(server,{
    cors:{
        origin:"*",
    }
});

const chat = io.of('/chat');

chat.on('connection',(chatSocket)=>{
    console.log(chatSocket.id+" chatsocket connected to the server");
    chatSocket.on('join-room',(roomID)=>{
        chatSocket.join(roomID);
        console.log(`${chatSocket.id} chatsocket joined the ${roomID}`);
    })

    chatSocket.on('message',(txtMsg,userName)=>{
        console.log(`${chatSocket.id} sent a message ${txtMsg}`);
        chatSocket.to(Array.from(chatSocket.rooms)[1]).emit('message',txtMsg,userName);
    })
    chatSocket.on('disconnect',()=>{
        console.log(`${chatSocket.id} disconnected`);
        chatSocket.disconnect();
    })
    // chatSocket.on('chatHang',()=>{
    //     // socket.disconnect();
    //     socket.to(Array.from(socket.rooms)[1]).emit('disconnect',socket.id);
    //     socket.leave(Array.from(socket.rooms)[1]);
    // })
    
})

io.on('connection',(socket)=>{
    console.log(socket.id+" connected to the server");
    socket.on('join-room',(roomID)=>{
        socket.join(roomID);
        console.log(`${socket.id} joined the room ${roomID}`);

        socket.to(roomID).emit('user-connected',socket.id);

        socket.on('offer',(offer,newuserID)=>{
            console.log(`offer sent from ${socket.id} to ${newuserID}`);
            socket.to(newuserID).emit('offer',offer,socket.id)
        });

        socket.on('answer',(answer,peerID)=>{
            console.log(`answer sent from ${socket.id} to ${peerID}`);
            socket.to(peerID).emit('answer',answer,socket.id);
        });

        socket.on('icecandidate',(candidate,newuserID)=>{
            console.log(`icecandidate sent from ${socket.id} to ${newuserID}`);
            socket.to(newuserID).emit('icecandidate',candidate,socket.id);
        })
    });

    socket.on('disconnect',()=>{
        console.log(socket.id+" disconnected");
    })

    socket.on('hangup',()=>{
        // socket.disconnect();
        socket.to(Array.from(socket.rooms)[1]).emit('dscnt',socket.id);
        socket.leave(Array.from(socket.rooms)[1]);
    })
});

const PORT = process.env.PORT || 5050;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});