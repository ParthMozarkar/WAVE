import React, { useState, useEffect } from 'react';
import { signalingService } from '../../services/multiplayer/signaling';
import { useWebRTC } from '../../hooks/multiplayer/useWebRTC';
import { useSessionClock } from '../../hooks/multiplayer/useSessionClock';
import { useMusicalSync } from '../../hooks/multiplayer/useMusicalSync';
import { useGestureMapping } from '../../hooks/useGestureMapping';
import { useGestureDetection } from '../../hooks/useGestureDetection';
import { useHandTracking } from '../../hooks/useHandTracking';
import '../../styles/app.css';

export function MultiplayerRoom({ roomCode, onLeave }) {
  const [room, setRoom] = useState(signalingService.currentRoom);
  
  useEffect(() => {
    const handleUpdate = (updatedRoom) => {
      setRoom(updatedRoom);
    };
    
    signalingService.on("room-update", handleUpdate);
    return () => signalingService.off("room-update", handleUpdate);
  }, []);

  if (!room) return <div style={{ color: 'var(--w-text)', padding: 40, fontFamily: 'var(--w-font)' }}>INITIALIZING HUB...</div>;

  if (room.state === 'LOBBY') {
    return <Lobby room={room} roomCode={roomCode} onLeave={onLeave} />;
  }

  return <Performance room={room} roomCode={roomCode} onLeave={onLeave} />;
}

function Lobby({ room, roomCode, onLeave }) {
  const isHost = room.hostId === signalingService.socket?.id;
  const me = room.participants.find(p => p.id === signalingService.socket?.id);

  const toggleReady = () => {
    signalingService.updateParticipant(roomCode, { ready: !me.ready });
  };

  const changeInstrument = (inst) => {
    signalingService.updateParticipant(roomCode, { instrument: inst });
  };

  const startBand = () => {
    signalingService.startPerformance(roomCode);
  };

  const allReady = room.participants.every(p => p.ready);

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'radial-gradient(circle at 50% 100%, rgba(0,229,255,0.05) 0%, #0a0a0f 100%)',
      color: 'var(--w-text)',
      fontFamily: 'var(--w-font)',
      padding: '40px 60px',
      boxSizing: 'border-box'
    }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 60 }}>
        <div>
          <h1 style={{ margin: 0, fontFamily: 'var(--w-font-display)', fontStyle: 'italic', fontSize: 32, fontWeight: 300, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span>STAGE:</span>
            <span style={{ color: 'var(--w-cyan)', textShadow: '0 0 15px var(--w-cyan-glow)', fontFamily: 'var(--w-font-mono, monospace)', fontWeight: 700 }}>{roomCode}</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(roomCode);
                const btn = document.getElementById('lobbyCopyBtn');
                if (btn) {
                  btn.textContent = '✓ Copied';
                  setTimeout(() => { if (btn) btn.textContent = '📋 Copy Code'; }, 2000);
                }
              }}
              id="lobbyCopyBtn"
              style={{
                background: 'rgba(0, 229, 255, 0.1)',
                border: '1px solid rgba(0, 229, 255, 0.3)',
                color: 'var(--w-cyan)',
                padding: '4px 10px',
                borderRadius: 14,
                fontSize: 11,
                fontFamily: 'var(--w-font)',
                fontWeight: 500,
                letterSpacing: '0.04em',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              📋 Copy Code
            </button>
          </h1>
          <p style={{ margin: '5px 0 0 0', color: 'var(--w-text-muted)', fontSize: 12, letterSpacing: '0.1em' }}>WAITING FOR PERFORMERS</p>
        </div>
        <button onClick={onLeave} style={{
          background: 'transparent',
          border: '1px solid var(--w-glass-border)',
          color: 'var(--w-text-dim)',
          padding: '8px 16px',
          borderRadius: 20,
          fontSize: 11,
          letterSpacing: '0.1em',
          cursor: 'pointer'
        }}>LEAVE ROOM</button>
      </header>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', flex: 1, justifyContent: 'center', alignItems: 'flex-start' }}>
        {room.participants.map(p => {
          const isMe = p.id === me?.id;
          return (
            <div key={p.id} style={{
              position: 'relative',
              background: p.ready ? 'rgba(16, 185, 129, 0.03)' : 'var(--w-glass)',
              backdropFilter: 'blur(24px)',
              border: `1px solid ${p.ready ? 'rgba(16, 185, 129, 0.4)' : 'var(--w-glass-border)'}`,
              borderRadius: 24,
              padding: '30px 24px',
              width: 280,
              minHeight: 380,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: p.ready ? '0 10px 40px rgba(16, 185, 129, 0.15)' : '0 20px 50px rgba(0,0,0,0.6)',
              transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              overflow: 'hidden'
            }}>
              {/* Subtle background glow based on ready state */}
              <div style={{
                position: 'absolute',
                top: '-50%',
                left: '-50%',
                width: '200%',
                height: '200%',
                background: p.ready 
                  ? 'radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 60%)' 
                  : 'radial-gradient(circle, rgba(255, 255, 255, 0.02) 0%, transparent 60%)',
                pointerEvents: 'none',
                transition: 'all 0.5s ease',
                zIndex: 0
              }} />

              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 22, fontWeight: 300, color: 'var(--w-text)', letterSpacing: '0.02em' }}>
                      {p.name}
                    </h3>
                    {p.id === room.hostId && (
                      <span style={{ fontSize: 9, color: 'var(--w-cyan)', letterSpacing: '0.15em', fontWeight: 600, textTransform: 'uppercase' }}>Session Host</span>
                    )}
                  </div>
                  <div style={{
                    background: p.ready ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                    border: `1px solid ${p.ready ? 'rgba(16, 185, 129, 0.3)' : 'var(--w-glass-border)'}`,
                    color: p.ready ? '#10b981' : 'var(--w-text-muted)',
                    padding: '6px 14px',
                    borderRadius: 20,
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    boxShadow: p.ready ? '0 0 15px rgba(16, 185, 129, 0.2)' : 'none'
                  }}>{p.ready ? 'READY' : 'TUNING'}</div>
                </div>

                {/* Instrument Icon Placeholder */}
                <div style={{
                  width: 80,
                  height: 80,
                  margin: '30px auto',
                  borderRadius: '50%',
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid var(--w-glass-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 32,
                  boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)'
                }}>
                  {p.instrument === 'guitar' && '🎸'}
                  {p.instrument === 'piano' && '🎹'}
                  {p.instrument === 'bass' && '🎸'}
                  {p.instrument === 'drums' && '🥁'}
                </div>
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', position: 'relative', zIndex: 1 }}>
                {isMe ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                    <div>
                      <label style={{ fontSize: 10, color: 'var(--w-cyan)', letterSpacing: '0.1em', fontWeight: 500, textTransform: 'uppercase' }}>Instrument Select</label>
                      <select value={me.instrument} onChange={e => changeInstrument(e.target.value)} style={{
                        width: '100%',
                        background: 'rgba(0,0,0,0.6)',
                        border: '1px solid rgba(0,229,255,0.3)',
                        color: 'white',
                        padding: '12px 14px',
                        borderRadius: 12,
                        marginTop: 8,
                        outline: 'none',
                        fontSize: 13,
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                      }}>
                        <option value="guitar">WAVE Synth (Guitar)</option>
                        <option value="piano">WAVE Sine (Piano)</option>
                        <option value="bass">WAVE Sub (Bass)</option>
                        <option value="drums">WAVE Air Drums</option>
                      </select>
                    </div>
                    <button onClick={toggleReady} style={{
                      background: me.ready ? 'rgba(255,255,255,0.1)' : 'var(--w-cyan)',
                      color: me.ready ? 'white' : '#000',
                      border: 'none',
                      padding: '14px',
                      borderRadius: 12,
                      fontWeight: 600,
                      fontSize: 12,
                      letterSpacing: '0.1em',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      boxShadow: me.ready ? 'none' : '0 0 20px var(--w-cyan-glow)'
                    }}>
                      {me.ready ? 'CANCEL READY' : 'LOCK IN & READY'}
                    </button>
                  </div>
                ) : (
                  <div style={{
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--w-glass-border)',
                    padding: 16,
                    borderRadius: 12,
                    textAlign: 'center'
                  }}>
                    <div style={{ color: 'var(--w-text-muted)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
                      Selected Instrument
                    </div>
                    <div style={{ color: 'var(--w-cyan)', fontSize: 14, fontWeight: 500 }}>
                      {p.instrument === 'guitar' ? 'WAVE Synth' : p.instrument === 'piano' ? 'WAVE Sine' : p.instrument === 'bass' ? 'WAVE Sub' : 'WAVE Air Drums'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {isHost && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
          <button disabled={!allReady} onClick={startBand} style={{
            background: allReady ? 'rgba(0, 229, 255, 0.1)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${allReady ? 'var(--w-cyan)' : 'var(--w-glass-border)'}`,
            color: allReady ? 'var(--w-cyan)' : 'var(--w-text-muted)',
            padding: '16px 40px',
            borderRadius: 30,
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: '0.15em',
            boxShadow: allReady ? '0 0 20px var(--w-cyan-glow)' : 'none',
            cursor: allReady ? 'pointer' : 'not-allowed',
            transition: 'all 0.3s ease'
          }}>
            {allReady ? 'BEGIN PERFORMANCE' : 'WAITING FOR PERFORMERS...'}
          </button>
        </div>
      )}
    </div>
  );
}

function Performance({ room, roomCode, onLeave }) {
  const { streams, initiateConnection } = useWebRTC(roomCode, signalingService.socket?.id);
  const { elapsed } = useSessionClock(room.startTime);
  const { broadcastEvent } = useMusicalSync(roomCode, 220.00); 

  useEffect(() => {
    room.participants.forEach(p => {
      // Prevent WebRTC offer collisions by ensuring only one peer initiates per pair
      if (p.id !== signalingService.socket?.id && signalingService.socket?.id > p.id) {
        initiateConnection(p.id);
      }
    });
  }, []);

  return (
    <div style={{ background: '#000', color: 'white', height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: 'var(--w-font)' }}>
      {/* Top Bar matching WAVE main app */}
      <div id="topControlBar" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.9) 0%, transparent 100%)', padding: '20px 30px' }}>
        <div className="top-bar-left">
          <div className="brand-label">WAVE</div>
          <div className="top-pill active" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 6, height: 6, background: '#ef4444', borderRadius: '50%', boxShadow: '0 0 10px #ef4444' }}></div>
            LIVE
          </div>
          <div className="top-pill">{roomCode}</div>
        </div>
        <div className="top-bar-right">
          <div style={{ color: 'var(--w-cyan)', fontFamily: 'var(--w-font-mono)', fontSize: 14 }}>
            {Math.floor(elapsed / 1000 / 60).toString().padStart(2, '0')}:{(Math.floor(elapsed / 1000) % 60).toString().padStart(2, '0')}
          </div>
          <button className="top-nav-btn" onClick={onLeave} style={{ marginLeft: 20 }}>LEAVE STAGE</button>
        </div>
      </div>
      
      {/* Camera Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: room.participants.length > 1 ? '1fr 1fr' : '1fr', 
        gridTemplateRows: room.participants.length > 2 ? '1fr 1fr' : '1fr',
        gap: 20, 
        padding: '80px 40px 40px 40px', 
        flex: 1 
      }}>
        {room.participants.map(p => {
          const isMe = p.id === signalingService.socket?.id;
          const stream = streams.get(p.id);
          
          return (
            <div key={p.id} style={{ 
              background: '#0a0a0f', 
              borderRadius: 24, 
              overflow: 'hidden', 
              position: 'relative',
              border: '1px solid var(--w-glass-border)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
            }}>
              {stream ? (
                isMe ? (
                  <LocalGesturePlayer stream={stream} muted={isMe} broadcastEvent={broadcastEvent} me={p} />
                ) : (
                  <VideoPlayer stream={stream} muted={isMe} />
                )
              ) : (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--w-text-muted)' }}>
                  {isMe ? 'Initializing Camera...' : 'Awaiting Video Stream...'}
                </div>
              )}
              
              {/* Participant Overlay */}
              <div style={{ 
                position: 'absolute', 
                bottom: 20, 
                left: 20, 
                background: 'var(--w-glass)', 
                backdropFilter: 'blur(10px)',
                padding: '8px 16px', 
                borderRadius: 12,
                border: '1px solid var(--w-glass-border)',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                zIndex: 10
              }}>
                <span style={{ fontWeight: 500 }}>{p.name}</span>
                <span style={{ width: 4, height: 4, background: 'var(--w-text-muted)', borderRadius: '50%' }}></span>
                <span style={{ color: 'var(--w-cyan)', fontSize: 11, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{p.instrument}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LocalGesturePlayer({ stream, muted, broadcastEvent, me }) {
  const videoRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const { mappingManager } = useGestureMapping();

  const handleChordChange = React.useCallback((chordData) => {
    broadcastEvent({
      type: 'chord',
      instrument: me.instrument,
      roman: chordData.roman,
      isMajorMode: chordData.isMajorMode,
      qualityIndex: chordData.qualityIndex,
      thumbDown: chordData.thumbDown,
      volume: chordData.volume,
      horizontalTilt: chordData.horizontalTilt
    });
  }, [broadcastEvent, me.instrument]);

  const { processHandFrame } = useGestureDetection(
    mappingManager,
    handleChordChange
  );

  const dummyAudioEngine = React.useMemo(() => {
    let isPlaying = false;
    return {
      setVolume: () => {},
      updateFilterSweep: () => {},
      playChord: () => {
        isPlaying = true;
      },
      fadeOut: () => {
        if (isPlaying) {
          isPlaying = false;
          broadcastEvent({ type: 'stop', instrument: me.instrument });
        }
      }
    };
  }, [broadcastEvent, me.instrument]);

  useHandTracking({
    videoRef,
    canvasRef,
    audioEngine: dummyAudioEngine,
    currentTonicFreq: 220.00,
    processHandFrame,
    perfMonitor: null,
    isRecordingActive: false,
    isPlaybackActive: false,
    isAudioStarted: true,
    active: true
  });

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <video ref={videoRef} autoPlay muted={muted} playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />
    </div>
  );
}

function VideoPlayer({ stream, muted }) {
  const ref = React.useRef(null);
  useEffect(() => {
    if (ref.current && stream) {
      ref.current.srcObject = stream;
    }
  }, [stream]);
  return <video ref={ref} autoPlay muted={muted} playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
}
