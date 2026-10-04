import { useState, useEffect, useRef } from 'react';
import { signalingService } from '../../services/multiplayer/signaling';

export function useWebRTC(roomCode, participantId) {
  const [streams, setStreams] = useState(new Map()); // participantId -> MediaStream
  const peersRef = useRef(new Map()); // participantId -> RTCPeerConnection
  const localStreamRef = useRef(null);

  useEffect(() => {
    // Initialize local stream
    async function initLocalStream() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        localStreamRef.current = stream;
        
        setStreams(prev => {
          const next = new Map(prev);
          next.set(participantId, stream);
          return next;
        });

        // Add tracks to all existing peers (if any were created before camera was ready)
        peersRef.current.forEach(peer => {
          stream.getTracks().forEach(track => {
            // Only add if not already added
            const senders = peer.getSenders();
            const hasTrack = senders.find(s => s.track === track);
            if (!hasTrack) {
              peer.addTrack(track, stream);
            }
          });
        });

      } catch (err) {
        console.error("Camera access denied", err);
      }
    }
    initLocalStream();

    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
      }
      peersRef.current.forEach(peer => peer.close());
    };
  }, [participantId]);

  const createPeer = (peerId) => {
    if (peersRef.current.has(peerId)) return peersRef.current.get(peerId);

    const peer = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        peer.addTrack(track, localStreamRef.current);
      });
    }

    peer.ontrack = (event) => {
      setStreams(prev => {
        const next = new Map(prev);
        next.set(peerId, event.streams[0]);
        return next;
      });
    };

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        signalingService.sendIceCandidate(peerId, event.candidate);
      }
    };

    // Modern perfect negotiation pattern
    peer.onnegotiationneeded = async () => {
      try {
        // Only one peer initiates to avoid collision
        if (signalingService.socket?.id > peerId) {
          const offer = await peer.createOffer();
          await peer.setLocalDescription(offer);
          signalingService.sendWebRTCOffer(peerId, offer);
        }
      } catch (err) {
        console.error("Negotiation error:", err);
      }
    };

    peersRef.current.set(peerId, peer);
    return peer;
  };

  useEffect(() => {
    const handleOffer = async ({ from, offer }) => {
      const peer = createPeer(from);
      await peer.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      signalingService.sendWebRTCAnswer(from, answer);
    };

    const handleAnswer = async ({ from, answer }) => {
      const peer = peersRef.current.get(from);
      if (peer) {
        await peer.setRemoteDescription(new RTCSessionDescription(answer));
      }
    };

    const handleCandidate = async ({ from, candidate }) => {
      const peer = peersRef.current.get(from);
      if (peer) {
        await peer.addIceCandidate(new RTCIceCandidate(candidate));
      }
    };

    signalingService.on("webrtc-offer", handleOffer);
    signalingService.on("webrtc-answer", handleAnswer);
    signalingService.on("webrtc-ice-candidate", handleCandidate);

    return () => {
      signalingService.off("webrtc-offer", handleOffer);
      signalingService.off("webrtc-answer", handleAnswer);
      signalingService.off("webrtc-ice-candidate", handleCandidate);
    };
  }, []);

  const initiateConnection = async (peerId) => {
    createPeer(peerId);
  };

  return { streams, initiateConnection };
}
