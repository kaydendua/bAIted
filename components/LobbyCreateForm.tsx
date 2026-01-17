'use client';

import { useState } from 'react';
import WaitingRoom from './WaitingRoom';
import DualChat from '../app/web-ide/dual-chat';

export default function LobbyCreateForm() {
  const [lobbyCreated, setLobbyCreated] = useState(false);
  const [lobbyId, setLobbyId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [selectedMode, setSelectedMode] = useState<'ai' | 'manual' | null>(null);

  const handleCreateLobby = () => {
    if (!playerName.trim()) {
      alert('Please enter your name');
      return;
    }

    const newLobbyId = Math.random().toString(36).substring(2, 8).toUpperCase();
    setLobbyId(newLobbyId);
    setLobbyCreated(true);
  };

  const handleJoinLobby = () => {
    if (!playerName.trim() || !lobbyId.trim()) {
      alert('Please enter your name and lobby ID');
      return;
    }
    setLobbyCreated(true);
  };

  const handleModeSelect = (mode: 'ai' | 'manual') => {
    setSelectedMode(mode);
  };

  // Show lobby create/join form
  if (!lobbyCreated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">bAIted</h1>
            <p className="text-gray-600">AI-Powered Coding Competition</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={handleCreateLobby}
              className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition-colors"
            >
              Create New Lobby
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">OR</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lobby ID
              </label>
              <input
                type="text"
                value={lobbyId}
                onChange={(e) => setLobbyId(e.target.value.toUpperCase())}
                placeholder="Enter lobby ID"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 mb-3"
              />
              <button
                onClick={handleJoinLobby}
                className="w-full px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium transition-colors"
              >
                Join Lobby
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show mode selection waiting room
  if (lobbyCreated && !selectedMode) {
    return (
      <WaitingRoom
        onSelectMode={handleModeSelect}
        lobbyId={lobbyId}
        playerName={playerName}
      />
    );
  }

  // Show the coding interface based on selected mode
  return (
    <DualChat
      mode={selectedMode!}
      lobbyId={lobbyId}
      playerName={playerName}
      onChangeMode={() => setSelectedMode(null)}
    />
  );
}