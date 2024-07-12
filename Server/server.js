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


const io = new Server(server,{
    cors:{
        origin:"*",
    }
});

const chat = io.of('/chat');

chat.on('connection',(chatSocket)=>{
    console.log(chatSocket.id+" chatsocket connected to the server");
    chatSocket.on('join-room',(room)=>{
        chatSocket.roomID = room;
        chatSocket.join(room);
        console.log(`${chatSocket.id} chatsocket joined the ${room}`);
    })

    chatSocket.on('message',(txtMsg,userName)=>{
        console.log(`${chatSocket.id} sent a message ${txtMsg}`);
        chatSocket.to(Array.from(chatSocket.rooms)[1]).emit('message',txtMsg,userName);
    });

    chatSocket.on('hang',()=>{
        console.log("A chating client is leaving room",chatSocket.roomID);
        chatSocket.leave(chatSocket.roomID);
    })
    
    chatSocket.on('disconnect',()=>{
        console.log(`${chatSocket.id} disconnected`);
        chatSocket.leave(chatSocket.roomID);
    })

})

io.on('connection',(socket)=>{
    console.log(socket.id+" connected to the server");
    socket.on('join-room',(room)=>{
        socket.roomID = room;
        socket.join(room);
        console.log(`${socket.id} joined the room ${room}`);

        socket.to(room).emit('user-connected',socket.id);
    });

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
    

    socket.on('hangup',()=>{
        socket.to(socket.roomID).emit('dscnt',socket.id);
        socket.leave(socket.roomID);
    });

    socket.on('disconnect', () => {
        console.log(`${socket.id}'s is ${socket.roomID}`);
        console.log(`user ${socket.id} disconnected`);
        
        if (socket.roomID) {
          socket.to(socket.roomID).emit('dscnt', socket.id);
        }
      });
      
    });

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});