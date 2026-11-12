import { contextBridge, ipcRenderer } from 'electron';

export interface LyricsParams {
  title: string;
  artist: string;
  duration?: number;
  album?: string;
}

export interface AudioStreamResult {
  url: string;
  mimeType?: string;
  duration?: number;
}

export interface LyricsResult {
  syncedLyrics?: string;
  plainLyrics?: string;
  instrumental?: boolean;
}

export interface ElectronAPI {
  ping: () => Promise<string>;
  searchSongs: (query: string) => Promise<any[]>;
  getHomeSongs: () => Promise<any[]>;
  getAudioStream: (videoId: string) => Promise<AudioStreamResult>;
  getLyrics: (params: LyricsParams) => Promise<LyricsResult | null>;
}

const api: ElectronAPI = {
  ping: () => ipcRenderer.invoke('ping'),
  searchSongs: (query: string) => ipcRenderer.invoke('yt:search', query),
  getHomeSongs: () => ipcRenderer.invoke('yt:getHome'),
  getAudioStream: (videoId: string) => ipcRenderer.invoke('yt:getStreamUrl', videoId),
  getLyrics: (params: LyricsParams) => ipcRenderer.invoke('lyrics:get', params),
};

try {
  contextBridge.exposeInMainWorld('electronAPI', api);
  console.log('[Preload] Successfully exposed window.electronAPI');
} catch (err) {
  console.error('[Preload] Failed to expose electronAPI:', err);
}
