'use client';

import { useState, useEffect, useCallback } from 'react';

export type FishType = 'goldfish' | 'clownfish' | 'betta' | 'tang' | 'angel' | 'shark' | 'ray' | 'jellyfish' | 'whale';

export interface Fish {
  id: string;
  type: FishType;
  level: number;
  addedAt: number;
  speed: number;
  size: number;
  yOffset: number;
}

export interface UserData {
  level: number;
  cumulativeMinutes: number;
  fish: Fish[];
  isTransferPaid: boolean;
  ownedScenes: string[];
  activeScene: string;
}

const DEFAULT_DATA: UserData = {
  level: 1,
  cumulativeMinutes: 0,
  fish: [],
  isTransferPaid: false,
  ownedScenes: ['default'],
  activeScene: 'default',
};

const STORAGE_KEY = 'aquarium_focus_data';

export function useAquarium() {
  const [data, setData] = useState<UserData>(DEFAULT_DATA);
  const [isLoaded, setIsLoaded] = useState(false);
  const [sessionMinutes, setSessionMinutes] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [duration, setDuration] = useState(300); // Default 5 mins

  // Load data
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setData(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved data', e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save data
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [data, isLoaded]);

  const addFish = useCallback(() => {
    const fishTypes: FishType[] = ['goldfish'];
    if (data.level >= 2) fishTypes.push('clownfish');
    if (data.level >= 3) fishTypes.push('betta', 'tang');
    if (data.level >= 5) fishTypes.push('angel', 'jellyfish');
    if (data.level >= 8) fishTypes.push('shark', 'ray');
    if (data.level >= 12) fishTypes.push('whale');

    const randomType = fishTypes[Math.floor(Math.random() * fishTypes.length)];
    const newFish: Fish = {
      id: Math.random().toString(36).substring(7),
      type: randomType,
      level: data.level,
      addedAt: Date.now(),
      speed: 20 + Math.random() * 20,
      size: 40 + Math.random() * 60,
      yOffset: 10 + Math.random() * 70, // percentage of screen height
    };

    // Whales and Sharks are bigger
    if (randomType === 'whale') {
      newFish.size *= 3;
      newFish.speed *= 1.5;
    }
    if (randomType === 'shark') {
      newFish.size *= 2;
      newFish.speed *= 0.8;
    }
    if (randomType === 'jellyfish') {
      newFish.speed *= 2; // slow
    }

    setData(prev => {
      const newFishList = [...prev.fish, newFish];
      // Keep only the latest 15 fish to avoid overcrowding
      const limitedFish = newFishList.slice(-15);
      
      return {
        ...prev,
        fish: limitedFish,
        cumulativeMinutes: prev.cumulativeMinutes + 5,
        level: Math.floor((prev.cumulativeMinutes + 5) / 60) + 1,
      };
    });
  }, [data.level]);

  const startSession = () => setIsActive(true);
  const stopSession = () => {
    setIsActive(false);
    setSessionMinutes(0);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      interval = setInterval(() => {
        setSessionMinutes(prev => {
          const next = prev + 1;
          if (next >= duration) {
            addFish();
            return 0;
          }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, addFish]);

  const exportData = () => {
    if (!data.isTransferPaid) return null;
    const base64 = btoa(JSON.stringify(data));
    return base64;
  };

  const importData = (base64: string) => {
    try {
      const json = atob(base64);
      const imported = JSON.parse(json);
      setData(imported);
      return true;
    } catch (e) {
      return false;
    }
  };

  const payForTransfer = () => {
    setData(prev => ({ ...prev, isTransferPaid: true }));
  };

  const buyScene = (sceneId: string) => {
    setData(prev => ({
      ...prev,
      ownedScenes: [...prev.ownedScenes, sceneId],
      activeScene: sceneId
    }));
  };

  return {
    data,
    isActive,
    sessionMinutes,
    startSession,
    stopSession,
    addFish,
    exportData,
    importData,
    payForTransfer,
    buyScene,
    isLoaded,
    duration,
    setDuration
  };
}
