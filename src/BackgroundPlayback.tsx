import { useEffect, useRef } from 'react';

const YOUTUBE_VIDEO_ID = '67IXkAa716E';
const SPOTIFY_TRACK_URI = 'spotify:track:04ORa77BfY0p4une7i8HYk';

type YTPlayer = {
  mute: () => void;
  setVolume: (volume: number) => void;
  playVideo: () => void;
  destroy: () => void;
};

type YTPlayerEvent = { target: YTPlayer };

type YTNamespace = {
  Player: new (
    element: HTMLElement,
    options: {
      host: string;
      width: number;
      height: number;
      videoId: string;
      playerVars: Record<string, number | string>;
      events: {
        onReady: (event: YTPlayerEvent) => void;
        onStateChange: (event: YTPlayerEvent) => void;
      };
    },
  ) => YTPlayer;
};

type SpotifyEmbedController = {
  destroy: () => void;
};

type SpotifyIFrameAPI = {
  createController: (
    element: HTMLElement,
    options: { uri: string; width: number; height: number },
    callback: (controller: SpotifyEmbedController) => void,
  ) => void;
};

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
    onSpotifyIframeApiReady?: (api: SpotifyIFrameAPI) => void;
  }
}

const youtubeWaiters = new Set<() => void>();
let youtubeScriptStarted = false;
const spotifyWaiters = new Set<(api: SpotifyIFrameAPI) => void>();
let spotifyApi: SpotifyIFrameAPI | undefined;
let spotifyScriptStarted = false;

function whenYouTubeReady(ready: () => void) {
  if (window.YT?.Player) {
    ready();
    return () => {};
  }
  youtubeWaiters.add(ready);
  if (!youtubeScriptStarted) {
    youtubeScriptStarted = true;
    window.onYouTubeIframeAPIReady = () => {
      youtubeWaiters.forEach((waiter) => waiter());
      youtubeWaiters.clear();
    };
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(script);
  }
  return () => {
    youtubeWaiters.delete(ready);
  };
}

function whenSpotifyReady(ready: (api: SpotifyIFrameAPI) => void) {
  if (spotifyApi) {
    ready(spotifyApi);
    return () => {};
  }
  spotifyWaiters.add(ready);
  if (!spotifyScriptStarted) {
    spotifyScriptStarted = true;
    window.onSpotifyIframeApiReady = (api) => {
      spotifyApi = api;
      spotifyWaiters.forEach((waiter) => waiter(api));
      spotifyWaiters.clear();
    };
    const script = document.createElement('script');
    script.src = 'https://open.spotify.com/embed/iframe-api/v1';
    script.async = true;
    document.head.appendChild(script);
  }
  return () => {
    spotifyWaiters.delete(ready);
  };
}

function silence(player: YTPlayer) {
  player.mute();
  player.setVolume(0);
}

export function BackgroundPlayback() {
  const youtubeHost = useRef<HTMLDivElement>(null);
  const spotifyHost = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = youtubeHost.current;
    if (!host) return;
    let cancelled = false;
    let player: YTPlayer | undefined;
    let resume: (() => void) | undefined;

    const cancelWait = whenYouTubeReady(() => {
      if (cancelled || !host.isConnected || !window.YT) return;
      player = new window.YT.Player(host, {
        host: 'https://www.youtube-nocookie.com',
        width: 240,
        height: 135,
        videoId: YOUTUBE_VIDEO_ID,
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          iv_load_policy: 3,
          origin: window.location.origin,
        },
        events: {
          onReady: (event) => {
            if (cancelled) return;
            silence(event.target);
            event.target.playVideo();
            resume = () => {
              silence(event.target);
              event.target.playVideo();
            };
            window.addEventListener('pointerdown', resume, { once: true });
          },
          onStateChange: (event) => {
            if (cancelled) return;
            silence(event.target);
          },
        },
      });
    });

    return () => {
      cancelled = true;
      cancelWait();
      if (resume) window.removeEventListener('pointerdown', resume);
      try {
        player?.destroy();
      } catch {
        // The iframe can already be gone during a strict-mode remount.
      }
    };
  }, []);

  useEffect(() => {
    const host = spotifyHost.current;
    if (!host) return;
    let cancelled = false;
    let controller: SpotifyEmbedController | undefined;

    // Spotify's embed has no mute control. Starting it would be audible, so it stays paused.
    const cancelWait = whenSpotifyReady((api) => {
      if (cancelled || !host.isConnected) return;
      api.createController(host, {
        uri: SPOTIFY_TRACK_URI,
        width: 300,
        height: 80,
      }, (created) => {
        controller = created;
        if (cancelled) created.destroy();
      });
    });

    return () => {
      cancelled = true;
      cancelWait();
      try {
        controller?.destroy();
      } catch {
        // The iframe can already be gone during a strict-mode remount.
      }
    };
  }, []);

  return (
    <div className="background-playback" aria-hidden="true" inert>
      <div ref={youtubeHost} />
      <div ref={spotifyHost} />
    </div>
  );
}
