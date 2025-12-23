import React, { createContext, useContext, useState, useRef, useCallback, ReactNode } from 'react';
import { Audio } from 'expo-av';

/**
 * MediaPlayerContext - Ensures only ONE media (audio/video) plays at a time
 * Like Instagram/YouTube - when you tap a new video, the previous one stops
 */

interface MediaPlayerContextType {
  // Currently playing media ID
  currentPlayingId: string | null;
  // Register this media as playing (stops any other playing media)
  playMedia: (mediaId: string, stopCallback?: () => void) => void;
  // Stop current media
  stopMedia: (mediaId: string) => void;
  // Check if this media is the one currently playing
  isPlaying: (mediaId: string) => boolean;
  // Stop all media
  stopAll: () => void;
}

const MediaPlayerContext = createContext<MediaPlayerContextType | undefined>(undefined);

interface MediaPlayerProviderProps {
  children: ReactNode;
}

export function MediaPlayerProvider({ children }: MediaPlayerProviderProps) {
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  // Store callbacks to stop previously playing media
  const stopCallbackRef = useRef<(() => void) | null>(null);

  const playMedia = useCallback((mediaId: string, stopCallback?: () => void) => {
    // If another media is playing, stop it first
    if (currentPlayingId && currentPlayingId !== mediaId && stopCallbackRef.current) {
      stopCallbackRef.current();
    }
    
    // Set the new playing media
    setCurrentPlayingId(mediaId);
    stopCallbackRef.current = stopCallback || null;
  }, [currentPlayingId]);

  const stopMedia = useCallback((mediaId: string) => {
    if (currentPlayingId === mediaId) {
      setCurrentPlayingId(null);
      stopCallbackRef.current = null;
    }
  }, [currentPlayingId]);

  const isPlaying = useCallback((mediaId: string) => {
    return currentPlayingId === mediaId;
  }, [currentPlayingId]);

  const stopAll = useCallback(() => {
    if (stopCallbackRef.current) {
      stopCallbackRef.current();
    }
    setCurrentPlayingId(null);
    stopCallbackRef.current = null;
  }, []);

  return (
    <MediaPlayerContext.Provider value={{
      currentPlayingId,
      playMedia,
      stopMedia,
      isPlaying,
      stopAll,
    }}>
      {children}
    </MediaPlayerContext.Provider>
  );
}

export function useMediaPlayer() {
  const context = useContext(MediaPlayerContext);
  if (context === undefined) {
    throw new Error('useMediaPlayer must be used within a MediaPlayerProvider');
  }
  return context;
}

// Hook for individual media items to use
export function useMediaControl(mediaId: string) {
  const { currentPlayingId, playMedia, stopMedia, isPlaying } = useMediaPlayer();
  
  const startPlaying = useCallback((stopCallback?: () => void) => {
    playMedia(mediaId, stopCallback);
  }, [mediaId, playMedia]);

  const stopPlaying = useCallback(() => {
    stopMedia(mediaId);
  }, [mediaId, stopMedia]);

  const amIPlaying = isPlaying(mediaId);

  return {
    isPlaying: amIPlaying,
    startPlaying,
    stopPlaying,
    shouldStopBecauseOtherStarted: currentPlayingId !== null && currentPlayingId !== mediaId,
  };
}
