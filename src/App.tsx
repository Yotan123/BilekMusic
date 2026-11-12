import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './components/Sidebar';
import BottomPlayer from './components/BottomPlayer';
import QueuePanel from './components/QueuePanel';
import ProfileModal from './components/ProfileModal';
import HomeView from './views/HomeView';
import SearchView from './views/SearchView';
import LibraryView from './views/LibraryView';
import LyricsView from './views/LyricsView';
import { PlayerProvider } from './context/PlayerContext';
import { NavView } from './types';

function MainLayout() {
  const [view, setView] = useState<NavView>('home');
  const [lastView, setLastView] = useState<NavView>('home');

  const toggleLyrics = () => {
    if (view === 'lyrics') {
      setView(lastView);
    } else {
      setLastView(view);
      setView('lyrics');
    }
  };

  const renderCurrentView = () => {
    switch (view) {
      case 'home':
        return <HomeView />;
      case 'search':
        return <SearchView />;
      case 'library':
        return <LibraryView />;
      case 'lyrics':
        return <LyricsView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-zinc-950 min-w-[1000px] select-none overflow-hidden">
      {/* Upper Region: Sidebar + Main Content */}
      <div className="flex flex-1 min-h-0">
        <Sidebar
          view={view === 'lyrics' ? '' : view}
          setView={(newView) => {
            setView(newView);
            setLastView(newView);
          }}
        />

        <main
          className={`relative flex-1 min-w-0 ${
            view === 'lyrics' ? 'overflow-hidden' : 'overflow-y-auto noscroll'
          }`}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              className="h-full"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {renderCurrentView()}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Slide-out Play Queue Drawer */}
        <QueuePanel />

        {/* User Profile Modal */}
        <ProfileModal />
      </div>

      {/* Sticky Bottom Player Bar */}
      <BottomPlayer
        lyricsOn={view === 'lyrics'}
        toggleLyrics={toggleLyrics}
      />
    </div>
  );
}

export default function App() {
  return (
    <PlayerProvider>
      <MainLayout />
    </PlayerProvider>
  );
}
