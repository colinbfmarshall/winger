import React, { useEffect } from 'react';
import { useVideoPlayer } from 'expo-video';

const VideoPreloader = ({ topMoment, onVideoReady }) => {
  // Create video player for preloading only the top/first video
  const player = useVideoPlayer(topMoment?.video_url || '', player => {
    player.muted = true; // Mute for preloading
    player.playbackRate = 1.1;
    player.loop = false;
    player.showNowPlayingNotification = false;
  });

  useEffect(() => {
    if (!topMoment) return;

    let hasCalledReady = false;

    // Listen for status changes to know when video is ready
    const statusListener = ({ status }) => {
      console.log('Top video preload status:', status);
      if (status === 'readyToPlay' && !hasCalledReady) {
        hasCalledReady = true;
        console.log('Top video preloaded successfully');
        onVideoReady();
      }
    };

    // Add event listeners
    try {
      player.addListener('statusChange', statusListener);
    } catch (error) {
      console.error('Error adding status listener:', error);
      // Fallback - assume ready after timeout
      setTimeout(() => {
        if (!hasCalledReady) {
          hasCalledReady = true;
          onVideoReady();
        }
      }, 3000);
      return;
    }

    // Load top video asynchronously
    const loadVideo = async () => {
      try {
        console.log('Preloading top video:', topMoment.video_url);
        await player.replaceAsync(topMoment.video_url);
      } catch (error) {
        console.error('Error loading video for preload:', error);
        // Fallback - assume ready after timeout
        setTimeout(() => {
          if (!hasCalledReady) {
            hasCalledReady = true;
            onVideoReady();
          }
        }, 3000);
      }
    };

    loadVideo();

    // Cleanup - just remove listeners, let useVideoPlayer handle player disposal
    return () => {
      try {
        player.removeListener('statusChange', statusListener);
      } catch (error) {
        console.log('VideoPreloader cleanup - listener already removed:', error.message);
      }
    };
  }, [topMoment?.id, onVideoReady]);

  // This component doesn't render anything - it's just for preloading
  return null;
};

export default VideoPreloader;
