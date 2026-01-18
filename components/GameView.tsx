'use client';

import { useLobbyContext } from '@/lib/LobbyContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Bot, User, Code, Users } from 'lucide-react';

export default function GameView() {
  const { lobby, isImpostor, currentPlayer } = useLobbyContext();

  console.log('GameView render - lobby:', lobby);
  console.log('GameView - isImpostor:', isImpostor);

  if (!lobby) {
    console.log('❌ GameView: No lobby found');
    return (
      <div className="min-h-screen bg-black p-6 flex items-center justify-center">
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-6">
            <p className="text-gray-400">Loading game...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (lobby.status !== 'in-progress') {
    console.log('❌ GameView: Lobby status is not in-progress:', lobby.status);
    return (
      <div className="min-h-screen bg-black p-6 flex items-center justify-center">
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-6">
            <p className="text-gray-400">Waiting for game to start...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  console.log('✅ GameView: Rendering game interface');

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Role Banner - Full width */}
      {isImpostor ? (
        <div className="w-full bg-gradient-to-r from-red-900/40 via-red-800/40 to-red-900/40 border-b-2 border-red-500/50 backdrop-blur-sm">
          <div className="w-full px-6 py-6">
            <div className="flex items-center justify-center gap-4">
              <Bot className="w-10 h-10 text-red-400 animate-pulse" />
              <div className="text-center">
                <h2 className="text-3xl font-bold text-red-400 tracking-tight">AI IMPOSTOR</h2>
                <p className="text-red-300/80 mt-1">You have access to AI assistance. Code carefully to avoid detection.</p>
              </div>
              <Bot className="w-10 h-10 text-red-400 animate-pulse" />
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full bg-gradient-to-r from-blue-900/40 via-blue-800/40 to-blue-900/40 border-b-2 border-blue-500/50 backdrop-blur-sm">
          <div className="w-full px-6 py-6">
            <div className="flex items-center justify-center gap-4">
              <User className="w-10 h-10 text-blue-400" />
              <div className="text-center">
                <h2 className="text-3xl font-bold text-blue-400 tracking-tight">HUMAN CODER</h2>
                <p className="text-blue-300/80 mt-1">Solve authentically and identify the AI impostor among you.</p>
              </div>
              <User className="w-10 h-10 text-blue-400" />
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="w-full px-6 py-8 space-y-6">
        {/* Top Info Bar */}
        <div className="grid md:grid-cols-3 gap-4">
          {/* Lobby Info */}
          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Code className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Lobby Code</p>
                  <p className="text-lg font-bold tracking-wider text-purple-400">{lobby.code}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Players Count */}
          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Active Players</p>
                  <p className="text-lg font-bold text-blue-400">{lobby.players.length}/{lobby.maxPlayers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Your Role */}
          <Card className={`bg-gray-900/50 border-gray-800 backdrop-blur-sm ${isImpostor ? 'ring-1 ring-red-500/30' : 'ring-1 ring-blue-500/30'}`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isImpostor ? 'bg-red-500/20' : 'bg-green-500/20'}`}>
                  {isImpostor ? (
                    <Bot className="w-5 h-5 text-red-400" />
                  ) : (
                    <User className="w-5 h-5 text-green-400" />
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-400">Your Role</p>
                  <p className={`text-lg font-bold ${isImpostor ? 'text-red-400' : 'text-green-400'}`}>
                    {isImpostor ? 'Impostor' : 'Human'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar - Players & Instructions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Players List */}
            <Card className="bg-gray-900/70 border-gray-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Players
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {lobby.players.map((player) => (
                    <li
                      key={player.id}
                      className={`text-sm px-3 py-2 rounded-lg transition-colors ${
                        player.id === currentPlayer?.id
                          ? 'bg-blue-500/20 text-blue-400 font-semibold border border-blue-500/30'
                          : 'bg-gray-800/50 text-gray-300 hover:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{player.name}</span>
                        {player.isReady && (
                          <span className="text-green-400 text-xs">✓</span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card className="bg-gray-900/70 border-gray-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-base">How to Play</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-300">
                <div className="flex gap-2">
                  <span className="text-blue-400 font-bold">1.</span>
                  <p>Solve the coding challenge</p>
                </div>
                <div className="flex gap-2">
                  <span className="text-blue-400 font-bold">2.</span>
                  <p>Submit your solution</p>
                </div>
                <div className="flex gap-2">
                  <span className="text-blue-400 font-bold">3.</span>
                  <p>Vote for the AI impostor</p>
                </div>
                
                {isImpostor && (
                  <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 text-xs font-medium flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>You can use AI, but blend in naturally!</span>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Coding Area */}
          <div className="lg:col-span-3">
            <Card className="bg-gray-900/70 border-gray-800 backdrop-blur-sm h-full">
              <CardHeader className="border-b border-gray-800">
                <CardTitle className="text-white flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Coding Challenge
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Write your solution below
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="bg-gray-950/50 rounded-lg border border-gray-800 p-8 min-h-[500px] flex items-center justify-center">
                  <div className="text-center space-y-3">
                    <Code className="w-16 h-16 text-gray-600 mx-auto" />
                    <p className="text-gray-500 text-lg font-medium">
                      Code Editor Loading...
                    </p>
                    <p className="text-gray-600 text-sm">
                      Your coding environment will appear here
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
