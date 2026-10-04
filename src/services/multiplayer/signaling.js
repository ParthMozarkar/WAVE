import { io } from "socket.io-client";

class SignalingService {
  constructor() {
    this.socket = null;
    this.callbacks = new Map();
    this.currentRoom = null;
  }

  connect() {
    if (!this.socket) {
      // Force websocket to avoid HTTP Polling CORS issues with free tunnels
      this.socket = io("https://wave-multiplayer-parth.loca.lt", {
        transports: ['websocket']
      });

      this.socket.on("room-update", (room) => {
        this.currentRoom = room;
        this.trigger("room-update", room);
      });

      this.socket.on("performance-started", () => {
        this.trigger("performance-started");
      });

      this.socket.on("webrtc-offer", (data) => this.trigger("webrtc-offer", data));
      this.socket.on("webrtc-answer", (data) => this.trigger("webrtc-answer", data));
      this.socket.on("webrtc-ice-candidate", (data) => this.trigger("webrtc-ice-candidate", data));

      this.socket.on("musical-event", (event) => {
        this.trigger("musical-event", event);
      });
    }
  }

  createRoom() {
    return new Promise((resolve) => {
      this.socket.emit("create-room", (response) => {
        if (response.success && response.room) {
          this.currentRoom = response.room;
        }
        resolve(response);
      });
    });
  }

  joinRoom(roomCode, name) {
    return new Promise((resolve) => {
      this.socket.emit("join-room", { roomCode, name }, (response) => {
        if (response.success && response.room) {
          this.currentRoom = response.room;
        }
        resolve(response);
      });
    });
  }

  updateParticipant(roomCode, updates) {
    this.socket.emit("update-participant", { roomCode, updates });
  }

  startPerformance(roomCode) {
    this.socket.emit("start-performance", { roomCode });
  }

  sendWebRTCOffer(to, offer) {
    this.socket.emit("webrtc-offer", { to, offer });
  }

  sendWebRTCAnswer(to, answer) {
    this.socket.emit("webrtc-answer", { to, answer });
  }

  sendIceCandidate(to, candidate) {
    this.socket.emit("webrtc-ice-candidate", { to, candidate });
  }

  sendMusicalEvent(roomCode, event) {
    this.socket.emit("musical-event", { roomCode, event });
  }

  on(event, callback) {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, []);
    }
    this.callbacks.get(event).push(callback);
  }

  off(event, callback) {
    if (this.callbacks.has(event)) {
      const cbs = this.callbacks.get(event).filter((cb) => cb !== callback);
      this.callbacks.set(event, cbs);
    }
  }

  trigger(event, data) {
    if (this.callbacks.has(event)) {
      this.callbacks.get(event).forEach((cb) => cb(data));
    }
  }
}

export const signalingService = new SignalingService();
