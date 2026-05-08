'use client';

import React, { useMemo } from 'react';
import { Fish, FishType } from '@/hooks/useAquarium';

const FISH_COLORS: Record<FishType, string> = {
  goldfish: '#ffb347',
  clownfish: '#ff4b2b',
  betta: '#4b6cb7',
  tang: '#182848',
  angel: '#f8ff00',
  shark: '#78909c',
  ray: '#546e7a',
  jellyfish: '#ce93d8',
  whale: '#37474f'
};

const FishSVG = ({ type, size, color }: { type: FishType, size: number, color: string }) => {
  if (type === 'jellyfish') {
    return (
      <svg width={size} height={size * 1.2} viewBox="0 0 100 120" fill={color}>
        <path d="M10,50 Q50,0 90,50 L90,60 Q50,70 10,60 Z" opacity="0.8" />
        <path d="M20,60 L20,110" stroke={color} strokeWidth="2" strokeDasharray="5,5" />
        <path d="M40,60 L40,120" stroke={color} strokeWidth="2" strokeDasharray="5,5" />
        <path d="M60,60 L60,120" stroke={color} strokeWidth="2" strokeDasharray="5,5" />
        <path d="M80,60 L80,110" stroke={color} strokeWidth="2" strokeDasharray="5,5" />
      </svg>
    );
  }

  if (type === 'ray') {
    return (
      <svg width={size * 1.5} height={size} viewBox="0 0 150 100" fill={color}>
        <path d="M75,10 L140,50 L75,90 L10,50 Z" />
        <path d="M10,50 L0,50" stroke={color} strokeWidth="2" />
        <circle cx="120" cy="40" r="2" fill="black" />
        <circle cx="120" cy="60" r="2" fill="black" />
      </svg>
    );
  }

  if (type === 'shark') {
    return (
      <svg width={size * 2} height={size} viewBox="0 0 200 100" fill={color}>
        <path d="M20,50 Q100,0 180,50 Q100,100 20,50" />
        <path d="M100,30 L120,0 L140,35 Z" />
        <path d="M20,50 L0,30 L0,70 Z" />
        <circle cx="160" cy="40" r="3" fill="black" />
      </svg>
    );
  }

  if (type === 'whale') {
    return (
      <svg width={size * 2.5} height={size} viewBox="0 0 250 100" fill={color}>
        <path d="M20,50 Q125,0 230,50 Q125,100 20,50" />
        <path d="M20,50 L0,30 L0,70 Z" />
        <path d="M180,80 Q200,90 220,80" fill="none" stroke="white" strokeWidth="2" />
      </svg>
    );
  }

  return (
    <svg width={size} height={size / 1.5} viewBox="0 0 100 66" fill={color}>
      {/* Body */}
      <path d="M10,33 Q50,0 90,33 Q50,66 10,33" />
      {/* Tail */}
      <path d="M10,33 L0,15 L0,51 Z" />
      {/* Eye */}
      <circle cx="75" cy="25" r="5" fill="white" />
      <circle cx="77" cy="25" r="2" fill="black" />
      {/* Fins */}
      <path d="M50,15 Q60,5 70,15" opacity="0.7" />
      <path d="M50,51 Q60,61 70,51" opacity="0.7" />
    </svg>
  );
};

export const Aquarium = ({ fish, scene }: { fish: Fish[], scene: string }) => {
  const bubbles = useMemo(() => {
    return Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 4 + Math.random() * 12,
      delay: Math.random() * 15,
      duration: 8 + Math.random() * 7
    }));
  }, []);

  const seaweed = useMemo(() => {
    return Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      height: 40 + Math.random() * 100,
      width: 4 + Math.random() * 12,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      color: i % 2 === 0 ? '#1b4d3e' : '#2e8b57',
      zIndex: i % 3 === 0 ? 3 : 4
    }));
  }, []);

  return (
    <div className={`aquarium-container scene-${scene}`}>
      <div className="glass-shimmer" />
      <div className="water-surface" />
      
      {/* Seaweed */}
      <div className="seaweed-container">
        {seaweed.map(s => (
          <div 
            key={s.id} 
            className="seaweed" 
            style={{ 
              height: `${s.height}px`,
              width: `${s.width}px`,
              left: `${s.left}%`,
              position: 'absolute',
              bottom: '0',
              background: `linear-gradient(to top, #0a2d21, ${s.color})`,
              borderRadius: '10px 10px 0 0',
              animation: 'sway 4s ease-in-out infinite',
              animationDelay: `${s.delay}s`,
              transformOrigin: 'bottom',
              zIndex: s.zIndex,
              opacity: s.zIndex === 3 ? 0.6 : 1,
              filter: s.zIndex === 3 ? 'blur(1px)' : 'none'
            }} 
          />
        ))}
      </div>

      <div className="sand" />

      {/* Bubbles */}
      {bubbles.map(b => (
        <div
          key={b.id}
          className="bubble"
          style={{
            left: `${b.left}%`,
            width: b.size,
            height: b.size,
            animationDelay: `${b.delay}s`,
            animationDuration: `${b.duration}s`
          }}
        />
      ))}

      {/* Fish */}
      {fish.map(f => (
        <div
          key={f.id}
          className="fish-instance"
          style={{
            position: 'absolute',
            top: `${f.yOffset}%`,
            animationName: 'swim',
            animationDuration: `${f.speed}s`,
            animationIterationCount: 'infinite',
            animationTimingFunction: 'linear',
            zIndex: Math.floor(f.size)
          }}
        >
          <FishSVG type={f.type} size={f.size} color={FISH_COLORS[f.type]} />
        </div>
      ))}

      <style jsx>{`
        .aquarium-container {
          background: linear-gradient(180deg, #1e3c72 0%, #2a5298 100%);
          transition: background 1s ease;
        }
        .scene-deep {
          background: linear-gradient(180deg, #0f2027 0%, #203a43 50%, #2c5364 100%);
        }
        .scene-coral {
          background: linear-gradient(180deg, #4facfe 0%, #00f2fe 100%);
        }
        .fish-instance {
          filter: drop-shadow(0 5px 15px rgba(0,0,0,0.3));
        }
      `}</style>
    </div>
  );
};
