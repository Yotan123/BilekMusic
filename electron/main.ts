import { app, BrowserWindow, ipcMain, session } from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import YTMusic from 'ytmusic-api';
import { Ytdl, chooseFormat } from '@distube/ytdl-core';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

process.env.APP_ROOT = path.join(__dirname, '..');

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron');
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist');

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST;

let win: BrowserWindow | null = null;
let ytmusic: any = null;
const ytdl = new Ytdl();

// Pre-initialize YTMusic instance
async function getYTMusic() {
  if (!ytmusic) {
    try {
      const instance = new YTMusic();
      await instance.initialize();
      ytmusic = instance;
      console.log('[Electron Main] YTMusic initialized successfully');
    } catch (err: any) {
      console.error('[Electron Main] Failed to initialize YTMusic:', err.message);
    }
  }
  return ytmusic;
}

function createWindow() {
  const preloadPath = path.join(__dirname, 'preload.cjs');
  console.log('[Electron Main] Using preload path:', preloadPath, '(exists:', fs.existsSync(preloadPath), ')');

  win = new BrowserWindow({
    width: 1240,
    height: 820,
    minWidth: 1000,
    minHeight: 680,
    backgroundColor: '#09090b',
    title: 'BilekMusic',
    icon: path.join(__dirname, '../build/icon.ico'),
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webSecurity: false, // Ensures media streaming works without browser CORS issues
    },
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
    win.webContents.openDevTools({ mode: 'detach' });
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'));
  }
}

// Setup network headers to allow streaming YouTube Video/Audio without 403 or CORS blocking
function setupNetworkHeaders() {
  const filter = { urls: ['*://*.googlevideo.com/*'] };

  session.defaultSession.webRequest.onBeforeSendHeaders(filter, (details, callback) => {
    details.requestHeaders['Origin'] = 'https://www.youtube.com';
    details.requestHeaders['Referer'] = 'https://www.youtube.com/';
    details.requestHeaders['User-Agent'] =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';
    callback({ requestHeaders: details.requestHeaders });
  });

  session.defaultSession.webRequest.onHeadersReceived(filter, (details, callback) => {
    const responseHeaders = details.responseHeaders || {};
    responseHeaders['access-control-allow-origin'] = ['*'];
    responseHeaders['access-control-allow-methods'] = ['GET, HEAD, OPTIONS'];
    responseHeaders['access-control-allow-headers'] = ['*'];
    callback({ responseHeaders });
  });
}

// Helper to clean messy YouTube titles for LRCLIB accuracy
function cleanMusicTitle(rawTitle: string, rawArtist: string) {
  let title = rawTitle;

  // Remove common YouTube video tags: (Official Video), [Official Audio], etc.
  title = title.replace(
    /\s*[\(\[](?:official\s*(?:music\s*)?(?:video|audio|visualizer|lyric\s*video)|video\s*clip|clip\s*officiel|lyric\s*video|audio|lyrics|remastered|remaster)[\)\]]/gi,
    ''
  );

  // Remove featured artists from parentheses: (feat. Bruno Mars), [ft. Drake]
  title = title.replace(/\s*[\(\[](?:feat|ft)\.?\s+[^\)\]]+[\)\]]/gi, '');

  // Remove standalone "Official Video", etc.
  title = title.replace(/\s*official\s*(?:music\s*)?video/gi, '');

  // Remove trailing dashes or punctuation
  title = title.replace(/[-–—]\s*$/, '').trim();

  // If YouTube titled it as "Artist - Song Title"
  let extractedArtist = rawArtist;
  if (title.includes(' - ')) {
    const parts = title.split(' - ');
    if (parts.length === 2 && parts[0].trim().length > 0 && parts[1].trim().length > 0) {
      extractedArtist = parts[0].trim();
      title = parts[1].trim();
    }
  }

  // Also clean the artist name (remove " - Topic", ", etc.")
  extractedArtist = extractedArtist.replace(/\s*-\s*Topic$/i, '').trim();

  return { title: title.trim(), artist: extractedArtist.trim() };
}

// ---------------- IPC Handlers ----------------

ipcMain.handle('ping', async () => {
  return 'pong from electron main';
});

// Search YouTube Music
ipcMain.handle('yt:search', async (_event, query: string) => {
  console.log('[IPC yt:search] Starting search for query:', query);
  try {
    const yt = await getYTMusic();
    if (!yt) {
      console.warn('[IPC yt:search] YTMusic instance unavailable');
      return [];
    }

    const results = await yt.searchSongs(query);
    console.log(`[IPC yt:search] Found ${results.length} songs for "${query}"`);

    return results.map((item: any) => {
      const artistName =
        item.artist?.name ||
        (Array.isArray(item.artists)
          ? item.artists.map((a: any) => a.name).join(', ')
          : 'Unknown Artist');
      const thumbnails = item.thumbnails || [];
      const cover = thumbnails.length > 0 ? thumbnails[thumbnails.length - 1].url : '';

      return {
        id: item.videoId,
        videoId: item.videoId,
        title: item.name,
        artist: artistName,
        album: item.album?.name || 'Single',
        dur: typeof item.duration === 'number' ? item.duration : 240,
        cover,
        c: ['#27272a', '#ec4899'],
      };
    });
  } catch (err: any) {
    console.error('[IPC yt:search] Error:', err.message);
    return [];
  }
});

// Popular / Suggested tracks for Home View
ipcMain.handle('yt:getHome', async () => {
  console.log('[IPC yt:getHome] Fetching home suggestions');
  try {
    const yt = await getYTMusic();
    if (!yt) return [];

    const results = await yt.searchSongs('Popular Hits');
    console.log(`[IPC yt:getHome] Found ${results.length} home songs`);

    return results.slice(0, 15).map((item: any) => {
      const artistName =
        item.artist?.name ||
        (Array.isArray(item.artists)
          ? item.artists.map((a: any) => a.name).join(', ')
          : 'Unknown Artist');
      const thumbnails = item.thumbnails || [];
      const cover = thumbnails.length > 0 ? thumbnails[thumbnails.length - 1].url : '';

      return {
        id: item.videoId,
        videoId: item.videoId,
        title: item.name,
        artist: artistName,
        album: item.album?.name || 'Single',
        dur: typeof item.duration === 'number' ? item.duration : 240,
        cover,
        c: ['#3f3f46', '#ec4899'],
      };
    });
  } catch (err: any) {
    console.error('[IPC yt:getHome] Error:', err.message);
    return [];
  }
});

// Audio Stream Extraction via @distube/ytdl-core
ipcMain.handle('yt:getStreamUrl', async (_event, videoId: string) => {
  try {
    console.log('[IPC yt:getStreamUrl] Fetching audio stream for videoId:', videoId);
    const info = await ytdl.getInfo(videoId);

    const format = chooseFormat(info.formats, {
      filter: { hasAudio: true, hasVideo: false },
      quality: 'highestaudio',
    });

    if (!format || !format.url) {
      throw new Error('No audio format found');
    }

    console.log('[IPC yt:getStreamUrl] Stream found! Mime:', format.mimeType, 'Bitrate:', format.audioBitrate);

    return {
      url: format.url,
      mimeType: format.mimeType,
      duration: Number(info.videoDetails.lengthSeconds),
    };
  } catch (err: any) {
    console.error('[IPC yt:getStreamUrl] Error:', err.message);
    throw err;
  }
});

// High-Accuracy Synced & Plain Lyrics from LRCLIB
ipcMain.handle('lyrics:get', async (_event, params: any) => {
  const { title: rawTitle, artist: rawArtist, duration } = params;
  const userAgent = 'LyricalYT/1.0 (https://github.com/LyricalYT)';

  const cleaned = cleanMusicTitle(rawTitle, rawArtist);
  const title = cleaned.title;
  const artist = cleaned.artist;

  console.log(`[IPC lyrics:get] Searching lyrics for cleaned: "${title}" by "${artist}" (duration: ${duration}s)`);

  // 1. Try exact match with duration
  try {
    const getRes = await axios.get('https://lrclib.net/api/get', {
      params: {
        track_name: title,
        artist_name: artist,
        duration: duration ? Math.round(duration) : undefined,
      },
      headers: { 'User-Agent': userAgent },
      timeout: 6000,
    });

    if (getRes.data && getRes.data.syncedLyrics) {
      console.log('[IPC lyrics:get] Strategy 1 Exact Match found!');
      return {
        syncedLyrics: getRes.data.syncedLyrics,
        plainLyrics: getRes.data.plainLyrics,
        instrumental: getRes.data.instrumental,
      };
    }
  } catch (e) {
    // 404 is expected if exact match fails
  }

  // 1b. Try exact match WITHOUT duration constraint (tolerates YouTube video intro/outro differences)
  try {
    const getRes = await axios.get('https://lrclib.net/api/get', {
      params: {
        track_name: title,
        artist_name: artist,
      },
      headers: { 'User-Agent': userAgent },
      timeout: 6000,
    });

    if (getRes.data && getRes.data.syncedLyrics) {
      console.log('[IPC lyrics:get] Strategy 1b (Without Duration) Match found!');
      return {
        syncedLyrics: getRes.data.syncedLyrics,
        plainLyrics: getRes.data.plainLyrics,
        instrumental: getRes.data.instrumental,
      };
    }
  } catch (e) {}

  // 2. Intelligent Scored Search
  try {
    const query = `${title} ${artist}`.trim();
    console.log('[IPC lyrics:get] Strategy 2: Searching LRCLIB with query:', query);

    const searchRes = await axios.get('https://lrclib.net/api/search', {
      params: { q: query },
      headers: { 'User-Agent': userAgent },
      timeout: 7000,
    });

    const candidates = searchRes.data || [];
    if (Array.isArray(candidates) && candidates.length > 0) {
      let bestItem = null;
      let highestScore = -999;

      for (const item of candidates) {
        let score = 0;

        // Prefer synced lyrics heavily
        if (item.syncedLyrics) score += 60;
        else if (item.plainLyrics) score += 15;

        // Compare duration proximity
        if (duration && item.duration) {
          const diff = Math.abs(item.duration - duration);
          if (diff <= 2) score += 50;
          else if (diff <= 5) score += 35;
          else if (diff <= 10) score += 20;
          else if (diff <= 20) score += 5;
          else score -= 35; // Different duration means different edit or cover
        }

        // Title matching bonus
        const itemTitle = (item.name || item.trackName || '').toLowerCase();
        if (itemTitle === title.toLowerCase()) {
          score += 30;
        } else if (itemTitle.includes(title.toLowerCase())) {
          score += 15;
        }

        // Artist matching bonus
        const itemArtist = (item.artistName || '').toLowerCase();
        if (itemArtist.includes(artist.toLowerCase())) {
          score += 25;
        }

        if (score > highestScore) {
          highestScore = score;
          bestItem = item;
        }
      }

      if (bestItem && (bestItem.syncedLyrics || bestItem.plainLyrics)) {
        console.log(`[IPC lyrics:get] Best matched candidate: "${bestItem.name}" by "${bestItem.artistName}" (Score: ${highestScore})`);
        return {
          syncedLyrics: bestItem.syncedLyrics,
          plainLyrics: bestItem.plainLyrics,
          instrumental: bestItem.instrumental,
        };
      }
    }
  } catch (searchErr: any) {
    console.error('[IPC lyrics:get] LRCLIB search error:', searchErr.message);
  }

  return null;
});

// App Lifecycle
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
    win = null;
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(async () => {
  setupNetworkHeaders();
  createWindow();
  await getYTMusic();
});
