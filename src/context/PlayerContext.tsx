import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';
import { Song, LyricLine } from '../types';
import { SONGS as DEFAULT_SONGS, LYRICS as MOCK_LYRICS } from '../data/mockData';
import { parseLrc, parsePlainLyrics } from '../utils/lrcParser';

interface PlayerContextType {
  currentSong: Song;
  queue: Song[];
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  shuffle: boolean;
  repeat: boolean;
  likedSongs: Record<string | number, boolean>;
  likedList: Song[];
  lyrics: LyricLine[] | null;
  lyricsLoading: boolean;
  audioLoading: boolean;
  error: string | null;
  isQueueOpen: boolean;
  setIsQueueOpen: (open: boolean) => void;
  toggleQueue: () => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  addToQueue: (song: Song) => void;
  playSong: (song: Song, newQueue?: Song[]) => Promise<void>;
  togglePlay: () => void;
  pause: () => void;
  resume: () => void;
  seek: (time: number) => void;
  next: () => void;
  prev: () => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  setShuffle: (shuffle: boolean) => void;
  setRepeat: (repeat: boolean) => void;
  toggleLike: (songOrId?: Song | string | number) => void;
  setQueue: (queue: Song[]) => void;
  userName: string;
  setUserName: (name: string) => void;
  isProfileOpen: boolean;
  setIsProfileOpen: (open: boolean) => void;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [queue, setQueueState] = useState<Song[]>(DEFAULT_SONGS);
  const [currentSong, setCurrentSongState] = useState<Song>(DEFAULT_SONGS[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(DEFAULT_SONGS[0].dur);
  const [volume, setVolumeState] = useState<number>(70);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [shuffle, setShuffleState] = useState<boolean>(false);
  const [repeat, setRepeatState] = useState<boolean>(true);
  const [isQueueOpen, setIsQueueOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);

  const [userName, setUserNameState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('lyricalyt_user_name');
      return saved && saved.trim() ? saved.trim() : 'Alin';
    } catch {
      return 'Alin';
    }
  });

  const setUserName = useCallback((name: string) => {
    const trimmed = name.trim() || 'Alin';
    setUserNameState(trimmed);
    try {
      localStorage.setItem('lyricalyt_user_name', trimmed);
    } catch (err) {
      console.error('Failed to save user name:', err);
    }
  }, []);

  const [likedSongs, setLikedSongs] = useState<Record<string | number, boolean>>(() => {
    try {
      const saved = localStorage.getItem('lyricalyt_liked');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [likedList, setLikedList] = useState<Song[]>(() => {
    try {
      const savedList = localStorage.getItem('lyricalyt_liked_list');
      if (savedList) {
        const parsed = JSON.parse(savedList);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse lyricalyt_liked_list:', e);
    }

    // Fallback migration for existing users
    try {
      const savedMap = localStorage.getItem('lyricalyt_liked');
      if (savedMap) {
        const parsedMap = JSON.parse(savedMap);
        return DEFAULT_SONGS.filter((s) => parsedMap[s.id]);
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [lyrics, setLyrics] = useState<LyricLine[] | null>(null);
  const [lyricsLoading, setLyricsLoading] = useState<boolean>(false);
  const [audioLoading, setAudioLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mockTimerRef = useRef<NodeJS.Timeout | null>(null);

  // References to eliminate stale closure bugs during event callbacks
  const queueRef = useRef<Song[]>(queue);
  queueRef.current = queue;

  const currentSongRef = useRef<Song>(currentSong);
  currentSongRef.current = currentSong;

  const shuffleRef = useRef<boolean>(shuffle);
  shuffleRef.current = shuffle;

  const repeatRef = useRef<boolean>(repeat);
  repeatRef.current = repeat;

  const likedListRef = useRef<Song[]>(likedList);
  likedListRef.current = likedList;

  const nextRef = useRef<() => void>(() => {});
  const handleTrackEndedRef = useRef<() => void>(() => {});

  // Fetch LRCLIB Synced Lyrics with optional real audio duration override
  const fetchLyrics = useCallback(async (song: Song, overrideDuration?: number) => {
    setLyricsLoading(true);
    setError(null);

    const dur = overrideDuration || song.dur;

    if (typeof song.id === 'number' && MOCK_LYRICS[song.id]) {
      setLyrics(MOCK_LYRICS[song.id]);
      setLyricsLoading(false);
      return;
    }

    try {
      if (window.electronAPI?.getLyrics) {
        console.log(`[PlayerContext] Fetching lyrics for: "${song.title}" (${dur}s)`);
        const res = await window.electronAPI.getLyrics({
          title: song.title,
          artist: song.artist,
          album: song.album,
          duration: dur,
        });

        if (res?.syncedLyrics) {
          const parsed = parseLrc(res.syncedLyrics);
          console.log(`[PlayerContext] Successfully loaded ${parsed.length} synced lyric lines`);
          setLyrics(parsed);
        } else if (res?.plainLyrics) {
          const parsedPlain = parsePlainLyrics(res.plainLyrics, dur);
          setLyrics(parsedPlain);
        } else {
          setLyrics(null);
        }
      } else {
        setLyrics(null);
      }
    } catch (err: any) {
      console.warn('[PlayerContext] Lyrics fetch error:', err.message);
      setLyrics(null);
    } finally {
      setLyricsLoading(false);
    }
  }, []);

  // Pre-fetch lyrics on mount for the initial track
  useEffect(() => {
    if (DEFAULT_SONGS[0]) {
      fetchLyrics(DEFAULT_SONGS[0]);
    }
  }, [fetchLyrics]);

  // Initialize persistent HTML5 Audio Element
  useEffect(() => {
    console.log('[PlayerContext] Initializing audio engine. window.electronAPI available:', !!window.electronAPI);
    const audio = new Audio();
    audioRef.current = audio;
    audio.volume = volume / 100;
    audio.preload = 'auto';

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const onDurationChange = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onWaiting = () => setAudioLoading(true);
    const onCanPlay = () => setAudioLoading(false);

    // Call through mutable ref to always access the fresh state
    const onEnded = () => {
      console.log('[Audio] Track naturally ended event fired!');
      handleTrackEndedRef.current();
    };

    const onError = (e: any) => {
      console.warn('[Audio] HTML5 audio error or stream stalled:', e);
      setAudioLoading(false);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('durationchange', onDurationChange);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('canplay', onCanPlay);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('canplay', onCanPlay);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
      audio.pause();
      audio.src = '';
    };
  }, []);

  // Save liked songs map & list
  useEffect(() => {
    try {
      localStorage.setItem('lyricalyt_liked', JSON.stringify(likedSongs));
    } catch (err) {
      console.error('Failed to save liked songs:', err);
    }
  }, [likedSongs]);

  useEffect(() => {
    try {
      localStorage.setItem('lyricalyt_liked_list', JSON.stringify(likedList));
    } catch (err) {
      console.error('Failed to save liked songs list:', err);
    }
  }, [likedList]);

  // Play a song
  const playSong = useCallback(
    async (song: Song, newQueue?: Song[]) => {
      // 1. Immediately silence and stop any previous song!
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        audio.src = '';
      }
      setIsPlaying(false);
      setAudioLoading(true);

      if (mockTimerRef.current) {
        clearInterval(mockTimerRef.current);
        mockTimerRef.current = null;
      }

      console.log('[PlayerContext] Playing song:', song.title, 'by', song.artist);
      setCurrentSongState(song);
      currentSongRef.current = song;
      setCurrentTime(0);
      setDuration(song.dur || 180);
      setError(null);

      // Handle queue updates
      if (newQueue && newQueue.length > 0) {
        setQueueState(newQueue);
        queueRef.current = newQueue;
      } else {
        // If song is not in queue, insert it
        const exists = queueRef.current.some((s) => s.id === song.id);
        if (!exists) {
          const updated = [...queueRef.current, song];
          setQueueState(updated);
          queueRef.current = updated;
        }
      }

      // 2. Play Audio Stream
      if (song.videoId && window.electronAPI?.getAudioStream) {
        try {
          console.log('[PlayerContext] Requesting audio stream for videoId:', song.videoId);
          const stream = await window.electronAPI.getAudioStream(song.videoId);

          if (stream?.url && audio) {
            console.log('[PlayerContext] Audio stream received, duration:', stream.duration);
            audio.src = stream.url;
            audio.load();
            await audio.play();
            setIsPlaying(true);
            setAudioLoading(false);

            if (stream.duration) {
              setDuration(stream.duration);
            }

            // Fetch Lyrics using the real stream duration
            fetchLyrics(song, stream.duration);
          } else {
            throw new Error('Empty stream URL returned');
          }
        } catch (streamErr: any) {
          console.error('[PlayerContext] Audio stream error:', streamErr);
          setAudioLoading(false);
          setIsPlaying(false);
          setError(`Lagu "${song.title}" tidak tersedia di YouTube. Melanjutkan ke lagu berikutnya...`);

          // Auto-skip to the next available track
          setTimeout(() => {
            nextRef.current();
          }, 1500);
        }
      } else {
        // Fallback simulation timer if song doesn't have a videoId
        fetchLyrics(song);
        setIsPlaying(true);
        setAudioLoading(false);
        mockTimerRef.current = setInterval(() => {
          setCurrentTime((t) => {
            if (t >= (song.dur || 180)) {
              setTimeout(() => handleTrackEndedRef.current(), 0);
              return 0;
            }
            return t + 0.25;
          });
        }, 250);
      }
    },
    [fetchLyrics]
  );

  // Next track
  const next = useCallback(() => {
    const currentQ = queueRef.current;
    const currentS = currentSongRef.current;
    if (currentQ.length === 0) return;

    const currentIndex = currentQ.findIndex((s) => s.id === currentS.id);
    let nextIndex = 0;

    if (shuffleRef.current) {
      nextIndex = Math.floor(Math.random() * currentQ.length);
    } else if (currentIndex !== -1) {
      nextIndex = (currentIndex + 1) % currentQ.length;
    } else {
      nextIndex = 0;
    }

    console.log(`[PlayerContext] Advancing next: index ${currentIndex} (${currentS.title}) -> index ${nextIndex} (${currentQ[nextIndex]?.title})`);
    playSong(currentQ[nextIndex]);
  }, [playSong]);

  // Previous track
  const prev = useCallback(() => {
    const currentQ = queueRef.current;
    const currentS = currentSongRef.current;
    if (currentQ.length === 0) return;

    const audio = audioRef.current;
    const curTime = audio ? audio.currentTime : 0;

    if (curTime > 3) {
      if (audio) audio.currentTime = 0;
      setCurrentTime(0);
      return;
    }

    const currentIndex = currentQ.findIndex((s) => s.id === currentS.id);
    const prevIndex = (currentIndex - 1 + currentQ.length) % currentQ.length;
    playSong(currentQ[prevIndex]);
  }, [playSong]);

  // Pause
  const pause = useCallback(() => {
    if (audioRef.current) audioRef.current.pause();
    if (mockTimerRef.current) {
      clearInterval(mockTimerRef.current);
      mockTimerRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  // Track ended handler: Always advances if there are subsequent songs in queue!
  const handleTrackEnded = useCallback(() => {
    const currentQ = queueRef.current;
    const currentS = currentSongRef.current;
    if (currentQ.length === 0) return;

    const currentIndex = currentQ.findIndex((s) => s.id === currentS.id);
    const hasNext = currentIndex !== -1 && currentIndex + 1 < currentQ.length;

    console.log(`[PlayerContext] handleTrackEnded: currentIndex=${currentIndex}, total=${currentQ.length}, hasNext=${hasNext}, repeat=${repeatRef.current}`);

    if (hasNext) {
      next();
    } else if (repeatRef.current) {
      next();
    } else {
      pause();
      if (audioRef.current) audioRef.current.currentTime = 0;
      setCurrentTime(0);
    }
  }, [next, pause]);

  // Keep fresh references for the event listeners
  useEffect(() => {
    nextRef.current = next;
    handleTrackEndedRef.current = handleTrackEnded;
  }, [next, handleTrackEnded]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      pause();
    } else {
      if (audio.src && audio.src.startsWith('http')) {
        audio.play().catch(console.error);
        setIsPlaying(true);
      } else if (currentSongRef.current) {
        // If audio stream is not loaded yet, LOAD AND PLAY IT PROPERLY!
        playSong(currentSongRef.current);
      }
    }
  }, [isPlaying, pause, playSong]);

  const resume = useCallback(() => {
    if (audioRef.current && audioRef.current.src) {
      audioRef.current.play().catch(console.error);
      setIsPlaying(true);
    }
  }, []);

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (audio && audio.src) {
      audio.currentTime = time;
    }
    setCurrentTime(time);
  }, []);

  const setVolume = useCallback(
    (vol: number) => {
      const clamped = Math.max(0, Math.min(100, vol));
      setVolumeState(clamped);
      if (audioRef.current) {
        audioRef.current.volume = clamped / 100;
      }
      if (clamped > 0 && isMuted) {
        setIsMuted(false);
      }
    },
    [isMuted]
  );

  const toggleMute = useCallback(() => {
    if (isMuted) {
      setIsMuted(false);
      if (audioRef.current) audioRef.current.volume = (volume || 70) / 100;
    } else {
      setIsMuted(true);
      if (audioRef.current) audioRef.current.volume = 0;
    }
  }, [isMuted, volume]);

  const toggleLike = useCallback((target?: Song | string | number) => {
    let songToToggle: Song | undefined;
    let targetId: string | number;

    if (!target) {
      songToToggle = currentSongRef.current;
      targetId = songToToggle.id;
    } else if (typeof target === 'object' && target !== null && 'id' in target) {
      songToToggle = target as Song;
      targetId = target.id;
    } else {
      targetId = target;
      if (currentSongRef.current && currentSongRef.current.id === targetId) {
        songToToggle = currentSongRef.current;
      } else {
        songToToggle =
          queueRef.current.find((s) => s.id === targetId) ||
          likedListRef.current.find((s) => s.id === targetId) ||
          DEFAULT_SONGS.find((s) => s.id === targetId);
      }
    }

    setLikedSongs((prev) => {
      const nextMap = { ...prev };
      if (nextMap[targetId]) {
        delete nextMap[targetId];
      } else {
        nextMap[targetId] = true;
      }
      return nextMap;
    });

    setLikedList((prev) => {
      const exists = prev.some((s) => s.id === targetId);
      if (exists) {
        return prev.filter((s) => s.id !== targetId);
      } else if (songToToggle) {
        return [songToToggle, ...prev];
      }
      return prev;
    });
  }, []);

  const toggleQueue = useCallback(() => {
    setIsQueueOpen((prev) => !prev);
  }, []);

  const removeFromQueue = useCallback((index: number) => {
    setQueueState((prevQueue) => {
      const updated = prevQueue.filter((_, i) => i !== index);
      queueRef.current = updated;
      return updated;
    });
  }, []);

  const clearQueue = useCallback(() => {
    const single = [currentSongRef.current];
    setQueueState(single);
    queueRef.current = single;
  }, []);

  const addToQueue = useCallback((song: Song) => {
    setQueueState((prevQueue) => {
      const updated = [...prevQueue, song];
      queueRef.current = updated;
      return updated;
    });
  }, []);

  const setQueue = useCallback((newQ: Song[]) => {
    setQueueState(newQ);
    queueRef.current = newQ;
  }, []);

  const setShuffle = useCallback((sh: boolean) => {
    setShuffleState(sh);
    shuffleRef.current = sh;
  }, []);

  const setRepeat = useCallback((rep: boolean) => {
    setRepeatState(rep);
    repeatRef.current = rep;
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        queue,
        isPlaying,
        currentTime,
        duration,
        volume: isMuted ? 0 : volume,
        isMuted,
        shuffle,
        repeat,
        likedSongs,
        likedList,
        lyrics,
        lyricsLoading,
        audioLoading,
        error,
        isQueueOpen,
        setIsQueueOpen,
        toggleQueue,
        removeFromQueue,
        clearQueue,
        addToQueue,
        playSong,
        togglePlay,
        pause,
        resume,
        seek,
        next,
        prev,
        setVolume,
        toggleMute,
        setShuffle,
        setRepeat,
        toggleLike,
        setQueue,
        userName,
        setUserName,
        isProfileOpen,
        setIsProfileOpen,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = (): PlayerContextType => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};
