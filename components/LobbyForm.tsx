'use client';

import { useState } from 'react';
import { useLobby } from '@/lib/useLobby';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type Mode = 'create' | 'join';

export default function LobbyForm() {
  const { lobby, error, isLoading, isConnected, createLobby, joinLobby, startGame, isHost } = useLobby();
  const [mode, setMode] = useState<Mode>('create');
  const [playerName, setPlayerName] = useState('');
  const [lobbyCode, setLobbyCode] = useState('');

  const handleCreateLobby = () => {
    createLobby(playerName, 6);
  };

  const handleJoinLobby = () => {
    joinLobby(lobbyCode, playerName);
  };

  // If in a lobby, show lobby view
  if (lobby) {
    return (
      <Card className="max-w-120 grow">
        <CardHeader>
          <CardTitle>Lobby: {lobby.code}</CardTitle>
          <CardDescription>
            {isHost ? 'You are the host' : 'Waiting for host to start the game'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Lobby Code</Label>
            <div className="text-3xl font-bold tracking-widest text-center py-3 bg-muted rounded-md">
              {lobby.code}
            </div>
          </div>
          <div>
            <Label>Players ({lobby.players.length}/{lobby.maxPlayers})</Label>
            <ul className="mt-2 space-y-1">
              {lobby.players.map((player) => (
                <li key={player.id} className="text-sm">
                  {player.name} {player.id === lobby.hostSocketId && '(Host)'}
                </li>
              ))}
            </ul>
          </div>
          
          {isHost && lobby.players.length >= 3 && (
            <Button onClick={startGame} className="w-full">
              Start Game
            </Button>
          )}

          {isHost && lobby.players.length < 3 && (
            <p className="text-sm text-muted-foreground text-center">
              Need at least 3 players to start
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  // Show create/join form
  return (
    <Card className="max-w-120 grow">
      <CardHeader>
        <CardTitle>Join the Game</CardTitle>
        <CardDescription>
          {isConnected ? 'Connected to server' : 'Connecting...'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mode Toggle */}
        <div className="flex gap-2 p-1 bg-muted rounded-lg">
          <button
            onClick={() => setMode('create')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
              mode === 'create'
                ? 'bg-background shadow-sm'
                : 'hover:bg-background/50'
            }`}
          >
            Create Lobby
          </button>
          <button
            onClick={() => setMode('join')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
              mode === 'join'
                ? 'bg-background shadow-sm'
                : 'hover:bg-background/50'
            }`}
          >
            Join Lobby
          </button>
        </div>

        {/* Join Mode - Show lobby code input first */}
        {mode === 'join' && (
          <div className="space-y-2">
            <Label htmlFor="lobbyCode">Lobby Code</Label>
            <Input
              id="lobbyCode"
              placeholder="Enter 6-digit code"
              value={lobbyCode}
              onChange={(e) => setLobbyCode(e.target.value.toLowerCase())}
              maxLength={6}
              disabled={!isConnected || isLoading}
              className="text-center text-lg tracking-widest"
            />
          </div>
        )}

        {/* Player Name (shown for both modes) */}
        <div className="space-y-2">
          <Label htmlFor="playerName">Your Name</Label>
          <Input
            id="playerName"
            placeholder="Enter your name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            disabled={!isConnected || isLoading}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-sm text-red-500">
            {error}
          </div>
        )}

        {/* Action Button */}
        {mode === 'create' ? (
          <Button
            onClick={handleCreateLobby}
            disabled={!isConnected || isLoading || !playerName.trim()}
            className="w-full"
          >
            {isLoading ? 'Creating...' : 'Create Lobby'}
          </Button>
        ) : (
          <Button
            onClick={handleJoinLobby}
            disabled={!isConnected || isLoading || !playerName.trim() || !lobbyCode.trim()}
            className="w-full"
          >
            {isLoading ? 'Joining...' : 'Join Lobby'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
