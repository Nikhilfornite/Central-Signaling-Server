## Project Description

This project is a full-stack application that integrates a **signaling server** for **WebRTC video conferencing**, real-time messaging using **Socket.io**, and a **backend for user authentication**. It is designed to enable users to participate in video calls and exchange text messages in real time.

### Key Components

- **Signaling Server** (`server.js` in the `server` folder):
  - Facilitates WebRTC connections by managing signaling messages between clients.
  - Handles events like joining a room, sending offers, answers, and ICE candidates for peer-to-peer connections.
  
- **Backend Application** (`app.js` in the `authentication` folder):
  - Manages user authentication and other backend-related functionalities.
  
- **Client Side Application** (`client.ejs` in the `public` folder):
  - Contains frontend logic for WebRTC video calls and real-time messaging.
  
### Features

- **WebRTC Video Conferencing**: Peer-to-peer video calls within rooms.
- **Real-Time Text Chat**: Exchange of text messages during calls.
- **Authentication System**: User login and registration features.

### Prerequisites
  Ensure you have the following installed:
  - Node.js (v12 or later)
  - pgAdmin for postgreSQL server
    - Download Link For Windows   [https://sbp.enterprisedb.com/getfile.jsp?fileid=1258649](https://sbp.enterprisedb.com/getfile.jsp?fileid=1258649)
    - Download Link For MacOs     [https://sbp.enterprisedb.com/getfile.jsp?fileid=1258653](https://sbp.enterprisedb.com/getfile.jsp?fileid=1258653) 

### How to Run
   Since I hosted it in cloud, few configuration needs to be changed in order to run it in local and also database must be configured inside installed pgAdmin. Follow up the video below.
    
   [![Watch the demo video](https://img.youtube.com/vi/MlBhJLB_RHw/0.jpg)](https://www.youtube.com/watch?v=MlBhJLB_RHw)
    
   ### I have built two applications in the same project folder. So, open two separate terminals in VsCode by clicking Terminal at the top and choose New Terminal.
     Step 1. Inside the first terminal run the below commands
       cd Server      -> to navigate to Server folder.
       npm install    -> to download all dependencies.
       npm server.js  -> to start the server. 
     Step 2. Inside the second terminal run the below commands
       cd Authentication      -> to navigate to Authentication folder.
       npm install    -> to download all dependencies.
       npm app.js  -> to start the backend application. 
     Step 3. open the browser and type the localhost with the port number the second terminal gives.
