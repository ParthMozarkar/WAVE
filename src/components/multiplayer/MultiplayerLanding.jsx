import React, { useState, useEffect } from 'react';
import { signalingService } from '../../services/multiplayer/signaling';
import '../../styles/app.css';

export function MultiplayerLanding({ onNavigate }) {
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  // Pre-connect the WebSocket in the background so it's instantly ready when they click
  useEffect(() => {
    signalingService.connect();
  }, []);

  const handleCreateRoom = async () => {
    setIsCreating(true);
    const res = await signalingService.createRoom();
    if (res.success) {
      onNavigate(`/multiplayer/room/${res.roomCode}`);
    } else {
      setError('Failed to create room.');
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!roomCode) return;
    setIsJoining(true);
    const res = await signalingService.joinRoom(roomCode, playerName);
    if (res.success) {
      onNavigate(`/multiplayer/room/${roomCode.toUpperCase()}`);
    } else {
      setError(res.error || 'Failed to join room.');
    }
  };

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 50% 50%, #0a0a0f 0%, #050508 100%)',
      color: 'var(--w-text)',
      fontFamily: 'var(--w-font)',
      overflow: 'hidden'
    }}>
      {/* Background glow effects */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '60vw',
        height: '60vw',
        background: 'radial-gradient(circle, rgba(0,229,255,0.03) 0%, transparent 60%)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', marginBottom: 40 }}>
        <h1 style={{
          fontFamily: 'var(--w-font-display)',
          fontSize: 'clamp(40px, 8vw, 80px)',
          fontWeight: 300,
          fontStyle: 'italic',
          letterSpacing: '0.04em',
          margin: 0,
          textShadow: '0 0 40px var(--w-cyan-glow)',
          background: 'linear-gradient(to bottom, #fff, #aaa)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          VIRTUAL BAND
        </h1>
        <p style={{
          fontSize: '14px',
          color: 'var(--w-text-dim)',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          marginTop: 10
        }}>
          Synchronized Remote Performance
        </p>
      </div>

      {error && (
        <div style={{
          background: 'rgba(255, 60, 60, 0.1)',
          border: '1px solid rgba(255, 60, 60, 0.3)',
          color: '#ff6b6b',
          padding: '10px 20px',
          borderRadius: 'var(--w-radius)',
          marginBottom: 20,
          fontSize: 13,
          zIndex: 10
        }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: 30, zIndex: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
        {/* HOST CARD */}
        <div style={{
          background: 'var(--w-glass-solid)',
          backdropFilter: 'blur(20px)',
          border: '1px solid var(--w-glass-border)',
          borderRadius: '16px',
          padding: 40,
          width: 320,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
        }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: 24, fontWeight: 300, color: 'var(--w-cyan)' }}>Initialize Hub</h2>
          <p style={{ fontSize: 13, color: 'var(--w-text-muted)', textAlign: 'center', marginBottom: 30 }}>
            Create a secure synchronized room and invite other performers to join the session.
          </p>
          <button onClick={handleCreateRoom} style={{
            background: 'rgba(0, 229, 255, 0.1)',
            border: '1px solid var(--w-cyan)',
            color: 'var(--w-cyan)',
            padding: '12px 30px',
            borderRadius: '30px',
            fontSize: 12,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 0 15px var(--w-cyan-glow)'
          }}
          onMouseOver={e => { e.currentTarget.style.background = 'rgba(0, 229, 255, 0.2)'; }}
          onMouseOut={e => { e.currentTarget.style.background = 'rgba(0, 229, 255, 0.1)'; }}
          >
            {isCreating ? 'Creating...' : 'Create Room'}
          </button>
        </div>

        {/* JOIN CARD */}
        <div style={{
          background: 'var(--w-glass-solid)',
          backdropFilter: 'blur(20px)',
          border: '1px solid var(--w-glass-border)',
          borderRadius: '16px',
          padding: 40,
          width: 320,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
        }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: 24, fontWeight: 300, textAlign: 'center' }}>Join Session</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
            <input 
              type="text" 
              placeholder="STAGE ALIAS (YOUR NAME)" 
              value={playerName} 
              onChange={e => setPlayerName(e.target.value)}
              style={{
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid var(--w-glass-border)',
                color: 'white',
                padding: '12px 15px',
                borderRadius: '8px',
                fontSize: 12,
                letterSpacing: '0.05em',
                outline: 'none'
              }}
            />
            <input 
              type="text" 
              placeholder="ROOM CODE" 
              value={roomCode} 
              onChange={e => setRoomCode(e.target.value)}
              style={{
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid var(--w-glass-border)',
                color: 'var(--w-cyan)',
                padding: '12px 15px',
                borderRadius: '8px',
                fontSize: 14,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                outline: 'none',
                textAlign: 'center'
              }}
            />
            <button onClick={handleJoinRoom} disabled={!roomCode || isJoining} style={{
              background: 'var(--w-text)',
              border: 'none',
              color: '#000',
              padding: '12px',
              borderRadius: '8px',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor: roomCode && !isJoining ? 'pointer' : 'not-allowed',
              opacity: roomCode && !isJoining ? 1 : 0.5,
              marginTop: 10,
              transition: 'all 0.3s ease'
            }}>
              {isJoining ? 'Connecting...' : 'Connect'}
            </button>
          </div>
        </div>
      </div>

      <button onClick={() => onNavigate('/')} style={{
        position: 'absolute',
        top: 30,
        left: 30,
        background: 'transparent',
        border: 'none',
        color: 'var(--w-text-dim)',
        fontSize: 12,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        zIndex: 20
      }}
      onMouseOver={e => { e.currentTarget.style.color = 'var(--w-text)'; }}
      onMouseOut={e => { e.currentTarget.style.color = 'var(--w-text-dim)'; }}
      >
        <span>←</span> BACK TO WAVE
      </button>
    </div>
  );
}
