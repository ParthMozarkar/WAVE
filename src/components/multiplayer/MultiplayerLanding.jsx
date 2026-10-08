import React, { useState, useEffect } from 'react';
import { signalingService } from '../../services/multiplayer/signaling';
import '../../styles/app.css';

export function MultiplayerLanding({ onNavigate }) {
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [createdRoom, setCreatedRoom] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Pre-connect the WebSocket in the background so it's instantly ready when they click
  useEffect(() => {
    signalingService.connect();
  }, []);

  const handleCreateRoom = async () => {
    setIsCreating(true);
    setError('');
    const res = await signalingService.createRoom();
    if (res && res.success && res.room) {
      setCreatedRoom(res.room);
      setIsCreating(false);
    } else {
      setError(res?.error || 'Failed to initialize session hub. Please try again.');
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!roomCode) return;
    setIsJoining(true);
    setError('');
    const res = await signalingService.joinRoom(roomCode, playerName);
    if (res && res.success) {
      onNavigate(`/multiplayer/room/${roomCode.toUpperCase()}`);
    } else {
      setError(res?.error || 'Failed to join room. Please check the code.');
      setIsJoining(false);
    }
  };

  const copyRoomCode = () => {
    if (!createdRoom) return;
    navigator.clipboard.writeText(createdRoom.id);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const copyShareLink = () => {
    if (!createdRoom) return;
    const url = `${window.location.origin}/multiplayer/room/${createdRoom.id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
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
      overflow: 'hidden',
      padding: '40px 20px',
      boxSizing: 'border-box'
    }}>
      {/* Background glow effects */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '60vw',
        height: '60vw',
        background: 'radial-gradient(circle, rgba(0,229,255,0.04) 0%, transparent 60%)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', marginBottom: 40 }}>
        <h1 style={{
          fontFamily: 'var(--w-font-display)',
          fontSize: 'clamp(40px, 8vw, 76px)',
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
          fontSize: '13px',
          color: 'var(--w-text-dim)',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          marginTop: 10
        }}>
          Synchronized Remote Jam Session
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

      {/* ─── REAL ROOM DETAILS MODAL / CARD ─── */}
      {createdRoom ? (
        <div style={{
          background: 'var(--w-glass-solid)',
          backdropFilter: 'blur(28px)',
          border: '1px solid rgba(0, 229, 255, 0.35)',
          borderRadius: '20px',
          padding: '36px 40px',
          width: 'min(460px, 92vw)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7), 0 0 30px rgba(0, 229, 255, 0.12)',
          zIndex: 20,
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <div style={{
            fontSize: '11px',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--w-cyan)',
            marginBottom: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}>
            <span style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'var(--w-cyan)',
              boxShadow: '0 0 8px var(--w-cyan)'
            }} />
            Room Created Successfully
          </div>

          <h2 style={{
            margin: '0 0 6px 0',
            fontSize: 22,
            fontWeight: 400,
            color: '#fff',
            fontFamily: 'var(--w-font-display)',
            fontStyle: 'italic'
          }}>
            Your Band Room is Ready
          </h2>

          <p style={{
            fontSize: 13,
            color: 'var(--w-text-muted)',
            textAlign: 'center',
            margin: '0 0 24px 0'
          }}>
            Share this room code or direct link with other performers to jam together in real time.
          </p>

          {/* Real Room Code Display */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(0, 229, 255, 0.25)',
            borderRadius: '12px',
            padding: '16px 24px',
            width: '100%',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
            marginBottom: 20
          }}>
            <div style={{ fontSize: 11, color: 'var(--w-text-dim)', letterSpacing: '0.1em' }}>
              ROOM CODE / ID
            </div>
            <div style={{
              fontSize: 34,
              fontWeight: 700,
              fontFamily: 'var(--w-font-mono, monospace)',
              letterSpacing: '0.22em',
              color: 'var(--w-cyan)',
              textShadow: '0 0 20px rgba(0, 229, 255, 0.5)'
            }}>
              {createdRoom.id}
            </div>

            <div style={{ display: 'flex', gap: 10, width: '100%', marginTop: 4 }}>
              <button
                onClick={copyRoomCode}
                style={{
                  flex: 1,
                  background: copiedCode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                  border: `1px solid ${copiedCode ? 'rgba(16, 185, 129, 0.5)' : 'var(--w-glass-border)'}`,
                  color: copiedCode ? '#34d399' : 'var(--w-text)',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: 11,
                  letterSpacing: '0.06em',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  transition: 'all 0.2s ease'
                }}
              >
                {copiedCode ? '✓ Copied Code' : '📋 Copy Code'}
              </button>

              <button
                onClick={copyShareLink}
                style={{
                  flex: 1,
                  background: copiedLink ? 'rgba(16, 185, 129, 0.2)' : 'rgba(0, 229, 255, 0.1)',
                  border: `1px solid ${copiedLink ? 'rgba(16, 185, 129, 0.5)' : 'rgba(0, 229, 255, 0.3)'}`,
                  color: copiedLink ? '#34d399' : 'var(--w-cyan)',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: 11,
                  letterSpacing: '0.06em',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  transition: 'all 0.2s ease'
                }}
              >
                {copiedLink ? '✓ Copied Link' : '🔗 Copy Link'}
              </button>
            </div>
          </div>

          {/* Real Participants List if available */}
          {createdRoom.participants && createdRoom.participants.length > 0 && (
            <div style={{
              width: '100%',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--w-glass-border)',
              borderRadius: '10px',
              padding: '12px 16px',
              boxSizing: 'border-box',
              marginBottom: 24
            }}>
              <div style={{
                fontSize: 11,
                color: 'var(--w-text-dim)',
                letterSpacing: '0.08em',
                marginBottom: 8,
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <span>PARTICIPANTS ({createdRoom.participants.length}/4)</span>
                <span style={{ color: 'var(--w-cyan)' }}>LOBBY</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {createdRoom.participants.map((p, idx) => (
                  <div key={p.id || idx} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: 12,
                    color: 'var(--w-text)'
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ color: 'var(--w-cyan)' }}>●</span>
                      <strong>{p.name || 'Host'}</strong>
                      {p.id === createdRoom.hostId && (
                        <span style={{
                          fontSize: 9,
                          padding: '1px 5px',
                          background: 'rgba(0, 229, 255, 0.15)',
                          color: 'var(--w-cyan)',
                          borderRadius: 4
                        }}>HOST</span>
                      )}
                    </span>
                    <span style={{ color: 'var(--w-text-muted)', textTransform: 'capitalize' }}>
                      {p.instrument || 'Piano'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 12, width: '100%' }}>
            <button
              onClick={() => setCreatedRoom(null)}
              style={{
                flex: 1,
                background: 'transparent',
                border: '1px solid var(--w-glass-border)',
                color: 'var(--w-text-dim)',
                padding: '13px 18px',
                borderRadius: '10px',
                fontSize: 12,
                letterSpacing: '0.08em',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Cancel
            </button>

            <button
              onClick={() => onNavigate(`/multiplayer/room/${createdRoom.id}`)}
              style={{
                flex: 2,
                background: 'linear-gradient(135deg, var(--w-cyan), #00b4d8)',
                border: 'none',
                color: '#0a0c10',
                padding: '13px 24px',
                borderRadius: '10px',
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: '0.08em',
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(0, 229, 255, 0.4)',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}
            >
              <span>Enter Room</span>
              <span>➔</span>
            </button>
          </div>
        </div>
      ) : (
        /* ─── INITIAL HOST / JOIN CARDS ─── */
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
              Create a synchronized music room and receive an instant code to invite bandmates.
            </p>
            <button
              onClick={handleCreateRoom}
              disabled={isCreating}
              style={{
                background: 'rgba(0, 229, 255, 0.1)',
                border: '1px solid var(--w-cyan)',
                color: 'var(--w-cyan)',
                padding: '12px 30px',
                borderRadius: '30px',
                fontSize: 12,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: isCreating ? 'wait' : 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 0 15px var(--w-cyan-glow)',
                opacity: isCreating ? 0.7 : 1
              }}
              onMouseOver={e => { if (!isCreating) e.currentTarget.style.background = 'rgba(0, 229, 255, 0.2)'; }}
              onMouseOut={e => { if (!isCreating) e.currentTarget.style.background = 'rgba(0, 229, 255, 0.1)'; }}
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
              <button
                onClick={handleJoinRoom}
                disabled={!roomCode || isJoining}
                style={{
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
                }}
              >
                {isJoining ? 'Connecting...' : 'Connect'}
              </button>
            </div>
          </div>
        </div>
      )}

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

export default MultiplayerLanding;
