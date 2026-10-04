import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for dev
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

// room code -> { hostId, participants: [{id, name, instrument, ready}], state, startTime, song }
const rooms = new Map();

function generateRoomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('create-room', (callback) => {
    let code;
    do {
      code = generateRoomCode();
    } while (rooms.has(code));

    const room = {
      id: code,
      hostId: socket.id,
      participants: [{ id: socket.id, name: 'Host', instrument: 'piano', ready: false }],
      state: 'LOBBY',
      song: null,
      startTime: null
    };
    rooms.set(code, room);
    socket.join(code);
    callback({ success: true, roomCode: code, room });
    io.to(code).emit('room-update', room);
  });

  socket.on('join-room', ({ roomCode, name }, callback) => {
    const code = roomCode.toUpperCase();
    if (!rooms.has(code)) {
      return callback({ success: false, error: 'Room not found' });
    }
    const room = rooms.get(code);
    if (room.participants.length >= 4) {
      return callback({ success: false, error: 'Room is full' });
    }

    const participant = { id: socket.id, name: name || `Player ${room.participants.length + 1}`, instrument: 'guitar', ready: false };
    room.participants.push(participant);
    socket.join(code);
    callback({ success: true, room });
    io.to(code).emit('room-update', room);
  });

  socket.on('update-participant', ({ roomCode, updates }) => {
    const room = rooms.get(roomCode);
    if (room) {
      const p = room.participants.find(x => x.id === socket.id);
      if (p) {
        Object.assign(p, updates);
        io.to(roomCode).emit('room-update', room);
      }
    }
  });

  socket.on('start-performance', ({ roomCode }) => {
    const room = rooms.get(roomCode);
    if (room && room.hostId === socket.id) {
      const allReady = room.participants.every(p => p.ready);
      if (!allReady) return; // Prevent start if not all ready
      
      room.state = 'PERFORMING';
      room.startTime = Date.now() + 2000; // start 2 seconds in the future to sync clients
      io.to(roomCode).emit('performance-started', { startTime: room.startTime });
      io.to(roomCode).emit('room-update', room);
    }
  });

  // WebRTC Signaling
  socket.on('webrtc-offer', ({ to, offer }) => {
    socket.to(to).emit('webrtc-offer', { from: socket.id, offer });
  });

  socket.on('webrtc-answer', ({ to, answer }) => {
    socket.to(to).emit('webrtc-answer', { from: socket.id, answer });
  });

  socket.on('webrtc-ice-candidate', ({ to, candidate }) => {
    socket.to(to).emit('webrtc-ice-candidate', { from: socket.id, candidate });
  });

  // Musical Event Synchronization
  socket.on('musical-event', ({ roomCode, event }) => {
    socket.to(roomCode).emit('musical-event', event);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    for (const [code, room] of rooms.entries()) {
      const idx = room.participants.findIndex(x => x.id === socket.id);
      if (idx !== -1) {
        room.participants.splice(idx, 1);
        if (room.participants.length === 0) {
          rooms.delete(code);
        } else {
          if (room.hostId === socket.id) {
            room.hostId = room.participants[0].id; // transfer host
          }
          io.to(code).emit('room-update', room);
        }
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`Signaling server running on port ${PORT}`);
});
