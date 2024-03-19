const express = require("express");
const Socket = require("socket.io");
const PORT = 5000;

const app = express();
const server = require("http").createServer(app);

const io = Socket(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const users = [];
const room = [];

io.on("connection", socket => {
  socket.on("adduser", username => {
    socket.user = username;
    users.push(username);
    io.sockets.emit("users", users);


    io.to(socket.id).emit("private", {
      id: socket.id,
      name: socket.user,
      msg: "secret message",
    });
  });

  /*socket.on("message", message => {
    io.sockets.emit("message", {
      message,
      user: socket.user,
      id: socket.id,
    });
  }); */
  
  
    
  
  
  
let roomName; // Định nghĩa biến roomName ở mức độ toàn cục để có thể sử dụng trong cả hai sự kiện

socket.on('joinRoom', (url) => {
    // Xử lý URL để lấy tên phòng (ví dụ: từ "/rooms/room1" lấy "room1")
    roomName = url.split('/').pop(); // Gán giá trị cho biến roomName

    // Tham gia vào phòng tương ứng với tên phòng
    socket.join(roomName);
	

    // Gửi thông báo cho client rằng đã tham gia vào phòng
    socket.emit('joinedRoom', roomName);
});

socket.on("message", message => {
    io.to(roomName).emit("message", {
        message,
        user: socket.user,
        id: socket.id,
    });
});
  
  
  socket.on('getRoomMembers', (roomName) => {
        // Lấy danh sách các socket ID trong phòng
        const socketsInRoom = io.sockets.adapter.rooms.get(roomName);
        
        // Nếu phòng tồn tại
        if (socketsInRoom) {
            const roomMembers = Array.from(socketsInRoom).map(socketId => io.sockets.sockets.get(socketId).user);
            // Gửi danh sách thành viên trong phòng về cho client
            socket.emit('roomMembers', roomMembers);
        } else {
            // Phòng không tồn tại
            socket.emit('roomNotFound');
        }
    });
  
  
  
  
  
  
  
  

  socket.on("disconnect", () => {
    console.log(`user ${socket.user} is disconnected`);
    if (socket.user) {
      users.splice(users.indexOf(socket.user), 1);
      io.sockets.emit("user", users);
      console.log("remaining users:", users);
    }
  });
});






server.listen(process.env.PORT || 5000);
