import React, { useEffect } from 'react';
import { useVideoPlayer } from 'expo-video';

const BottomVideoPreloader = ({ bottomMoment, onVideoReady }) => {
  // Create video player for preloading the bottom/second video
  const player = useVideoPlayer(bottomMoment?.video_url || '', player => {
    player.muted = true; // Mute for preloading
    player.playbackRate = 1.1;
    player.loop = false;
    player.showNowPlayingNotification = false;
  });

  useEffect(() => {
    if (!bottomMoment) return;

    let hasCalledReady = false;
    let isActive = true;

    // Listen for status changes to know when video is ready
    const statusListener = ({ status }) => {
      if (!isActive) return;
      
      console.log('Bottom video preload status:', status);
      if (status === 'readyToPlay' && !hasCalledReady) {
        hasCalledReady = true;
        console.log('Bottom video preloaded successfully');
        onVideoReady();
      }
    };

    // Add event listeners
    try {
      player.addListener('statusChange', statusListener);
    } catch (error) {
      console.error('Error adding bottom video status listener:', error);
      // Fallback - assume ready after timeout
      if (isActive) {
        setTimeout(() => {
          if (!hasCalledReady && isActive) {
            hasCalledReady = true;
            onVideoReady();
          }
        }, 3000);
      }
      return;
    }

    // Load bottom video asynchronously
    const loadVideo = async () => {
      if (!isActive) return;
      
      try {
        console.log('Preloading bottom video while top video plays:', bottomMoment.video_url);
        await player.replaceAsync(bottomMoment.video_url);
      } catch (error) {
        console.error('Error loading bottom video for preload:', error);
        // Fallback - assume ready after timeout
        if (isActive) {
          setTimeout(() => {
            if (!hasCalledReady && isActive) {
              hasCalledReady = true;
              onVideoReady();
            }
          }, 3000);
        }
      }
    };

    loadVideo();

    // Cleanup - just remove listeners, let useVideoPlayer handle player disposal
    return () => {
      isActive = false;
      try {
        player.removeListener('statusChange', statusListener);
      } catch (error) {
        console.log('BottomVideoPreloader cleanup - listener already removed:', error.message);
      }
    };
  }, [bottomMoment?.id, onVideoReady]);

  // This component doesn't render anything - it's just for preloading
  return null;
};

export default BottomVideoPreloader;
