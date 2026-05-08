'use client';

import React, { useState, useEffect } from 'react';
import { useAquarium } from '@/hooks/useAquarium';
import { Aquarium } from '@/components/Aquarium';
import {
  Play,
  Pause,
  Settings,
  Fish as FishIcon,
  Trophy,
  Download,
  Upload,
  CreditCard,
  X,
  Volume2,
  VolumeX
} from 'lucide-react';

export default function Home() {
  const {
    data,
    isActive,
    sessionMinutes,
    startSession,
    stopSession,
    exportData,
    importData,
    payForTransfer,
    buyScene,
    isLoaded,
    duration,
    setDuration
  } = useAquarium();

  const [showSettings, setShowSettings] = useState(false);
  const [importValue, setImportValue] = useState('');
  const [exportedValue, setExportedValue] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [audioStarted, setAudioStarted] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);

  const tracks = [
    { name: 'Lofi Vibe', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3' },
    { name: 'Midnight Zen', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3' },
    { name: 'Soft Rain', url: 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Rain_Sound_01.mp3' }
  ];

  // Audio handling
  useEffect(() => {
    const audio = document.getElementById('bg-music') as HTMLAudioElement;
    if (audio) {
      audio.volume = 0.3;
      if (!isMuted && audioStarted) {
        audio.play().catch(e => console.log('Autoplay blocked:', e));
      } else {
        audio.pause();
      }
    }
  }, [isMuted, audioStarted, currentTrack]);

  // Start audio on first interaction
  useEffect(() => {
    const startAudio = () => {
      setAudioStarted(true);
      window.removeEventListener('click', startAudio);
      window.removeEventListener('touchstart', startAudio);
    };
    window.addEventListener('click', startAudio);
    window.addEventListener('touchstart', startAudio);
    return () => {
      window.removeEventListener('click', startAudio);
      window.removeEventListener('touchstart', startAudio);
    };
  }, []);

  // Handle "must observe" - restart if visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && isActive) {
        stopSession();
        alert('You stopped observing! The timer has been reset.');
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isActive, stopSession]);

  if (!isLoaded) return <div className="loading">Loading Aquarium...</div>;

  const formatTime = (seconds: number) => {
    const remaining = duration - seconds;
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleExport = () => {
    const b64 = exportData();
    if (b64) {
      setExportedValue(b64);
    } else {
      alert('You need to purchase the Data Transfer feature first!');
    }
  };

  const handleImport = () => {
    if (importData(importValue)) {
      alert('Data imported successfully!');
      setImportValue('');
    } else {
      alert('Invalid data format.');
    }
  };

  return (
    <main className="main-layout">
      {/* Top Bar (5%) */}
      <div className="top-section">
        <div className="top-logo">
          <img src="/aquarium_focus_icon.png" alt="Stay Focus Logo" className="logo-img" />
          <span>Stay Focus</span>
        </div>
        <div className="top-buttons">
          <button
            className={`btn-icon ${duration === 5 ? 'active' : ''}`}
            onClick={() => {
              setDuration(duration === 5 ? 300 : 5);
              stopSession();
            }}
            title={duration === 5 ? 'Switch to 5m' : 'Switch to 5s'}
          >
            {duration === 5 ? '🧪' : '⏱️'}
          </button>

          <div className="top-timer">
            {formatTime(sessionMinutes)}
          </div>

          <button
            className={`btn-icon primary ${isActive ? 'active' : ''}`}
            onClick={isActive ? stopSession : startSession}
          >
            {isActive ? <Pause size={18} /> : <Play size={18} />}
          </button>

          <button
            className={`btn-icon ${!isMuted ? 'active' : ''}`}
            onClick={() => setIsMuted(!isMuted)}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          <button
            className="btn-icon"
            onClick={() => setShowSettings(true)}
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Bottom Section (95%) */}
      <div className="aquarium-wrapper">
        <Aquarium fish={data.fish} scene={data.activeScene} />

        {/* Audio Element */}
        <audio id="bg-music" loop key={currentTrack}>
          <source src={tracks[currentTrack].url} type="audio/mpeg" />
        </audio>

        {/* Overlays inside aquarium */}
        <div className="aquarium-stats">
          <div className="mini-badge">Lvl {data.level}</div>
          <div className="mini-badge">{data.fish.length} Fish</div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel">
            <div className="modal-header">
              <h3>Aquarium Settings</h3>
              <button onClick={() => setShowSettings(false)} className="close-btn">
                <X size={24} />
              </button>
            </div>

            <div className="settings-section">
              <h4>Data Transfer</h4>
              {!data.isTransferPaid ? (
                <button
                  className="btn btn-primary w-full"
                  onClick={() => {
                    if (duration === 5) {
                      payForTransfer();
                      alert('Demo: Data Transfer unlocked for free!');
                    } else {
                      payForTransfer();
                    }
                  }}
                >
                  <CreditCard size={18} />
                  {duration === 5 ? 'Unlock Transfer (Demo Free)' : 'Purchase Transfer Feature ($0.99)'}
                </button>
              ) : (
                <div className="transfer-controls">
                  <div className="export-area">
                    <button className="btn btn-ghost" onClick={handleExport}>
                      <Download size={18} /> Generate Export Data
                    </button>
                    {exportedValue && (
                      <div className="export-display">
                        <textarea
                          readOnly
                          value={exportedValue}
                          className="data-box"
                        />
                        <button
                          className="btn btn-primary w-full"
                          onClick={() => {
                            navigator.clipboard.writeText(exportedValue);
                            alert('Data copied to clipboard!');
                          }}
                        >
                          Copy to Clipboard
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="import-area">
                    <textarea
                      placeholder="Paste base64 data here..."
                      className="data-box"
                      value={importValue}
                      onChange={(e) => setImportValue(e.target.value)}
                    />
                    <button className="btn btn-ghost" onClick={handleImport}>
                      <Upload size={18} /> Import Data
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="settings-section">
              <h4>Unlock Scenes</h4>
              <div className="scenes-grid">
                {['default', 'deep', 'coral'].map(sceneId => (
                  <button
                    key={sceneId}
                    className={`scene-chip ${data.activeScene === sceneId ? 'active' : ''}`}
                    onClick={() => {
                      if (data.ownedScenes.includes(sceneId)) {
                        buyScene(sceneId); // Re-using buyScene to set active
                      } else {
                        if (duration === 5) {
                          buyScene(sceneId);
                          alert(`Demo: ${sceneId} unlocked for free!`);
                        } else {
                          if (confirm(`Unlock ${sceneId} scene for $1.99?`)) {
                            buyScene(sceneId);
                          }
                        }
                      }
                    }}
                  >
                    {sceneId.toUpperCase()}
                    {!data.ownedScenes.includes(sceneId) && ' 🔒'}
                  </button>
                ))}
              </div>
            </div>

            <div className="settings-section">
              <h4>Background Music</h4>
              <div className="music-grid">
                {tracks.map((track, index) => (
                  <button
                    key={index}
                    className={`music-chip ${currentTrack === index ? 'active' : ''}`}
                    onClick={() => setCurrentTrack(index)}
                  >
                    {track.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .main-layout {
          height: 100vh;
          display: flex;
          flex-direction: column;
          background: #041020;
          overflow: hidden;
        }
        .top-section {
          height: 5vh;
          background: #041020;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 15px;
          border-bottom: 1px solid var(--glass-border);
        }
        .top-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 800;
          font-size: 0.9rem;
          color: var(--primary);
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .logo-img {
          width: 24px;
          height: 24px;
          border-radius: 6px;
          object-fit: cover;
        }
        .top-buttons {
          display: flex;
          gap: 15px;
          align-items: center;
        }
        .top-timer {
          font-size: 1.2rem;
          font-weight: 800;
          color: var(--primary);
          font-variant-numeric: tabular-nums;
          text-shadow: 0 0 10px rgba(0, 210, 255, 0.3);
          min-width: 60px;
          text-align: center;
        }
        .btn-icon {
          background: none;
          border: 1px solid transparent;
          color: var(--text-dim);
          cursor: pointer;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          transition: all 0.2s ease;
          font-size: 1.2rem;
        }
        .btn-icon:hover {
          color: white;
          background: rgba(255,255,255,0.1);
        }
        .btn-icon.active {
          color: var(--accent);
          border-color: var(--accent);
        }
        .btn-icon.primary {
          background: var(--primary);
          color: white;
          border-radius: 50%;
        }
        .btn-icon.primary.active {
          background: var(--accent);
        }
        .aquarium-wrapper {
          height: 95vh;
          position: relative;
        }
        .aquarium-stats {
          position: absolute;
          top: 15px;
          left: 15px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          z-index: 50;
        }
        .mini-badge {
          background: var(--glass);
          backdrop-filter: blur(4px);
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: 600;
          border: 1px solid var(--glass-border);
        }
        .glass-shimmer {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            105deg,
            transparent 40%,
            rgba(255, 255, 255, 0.05) 45%,
            rgba(255, 255, 255, 0.1) 50%,
            rgba(255, 255, 255, 0.05) 55%,
            transparent 60%
          );
          background-size: 200% 100%;
          animation: shimmer 12s linear infinite;
          pointer-events: none;
          z-index: 15;
        }
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.8);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .modal-content {
          width: 95%;
          max-width: 400px;
          padding: 24px;
          max-height: 90vh;
          overflow-y: auto;
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .settings-section {
          margin-bottom: 24px;
        }
        .settings-section h4 {
          margin-bottom: 12px;
          opacity: 0.7;
          font-size: 0.9rem;
          text-transform: uppercase;
        }
        .data-box {
          width: 100%;
          height: 60px;
          background: rgba(0,0,0,0.3);
          border: 1px solid var(--glass-border);
          border-radius: 8px;
          color: white;
          padding: 8px;
          font-family: monospace;
          font-size: 0.7rem;
          margin: 8px 0;
        }
        .scenes-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }
        .scene-chip {
          padding: 10px;
          border-radius: 8px;
          border: 1px solid var(--glass-border);
          background: var(--glass);
          color: white;
          font-size: 0.7rem;
          cursor: pointer;
        }
        .scene-chip.active {
          border-color: var(--primary);
          background: rgba(0, 210, 255, 0.2);
        }
        .music-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }
        .music-chip {
          padding: 10px;
          border-radius: 8px;
          border: 1px solid var(--glass-border);
          background: var(--glass);
          color: white;
          font-size: 0.7rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .music-chip.active {
          border-color: var(--primary);
          background: rgba(0, 210, 255, 0.2);
        }
        .export-display {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 10px;
        }
        .w-full { width: 100%; }
        .close-btn { background: none; border: none; color: white; cursor: pointer; }
        .close-btn { background: none; border: none; color: white; cursor: pointer; }
      `}</style>
    </main>
  );
}
