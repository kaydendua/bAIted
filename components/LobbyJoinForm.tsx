'use client';

import { useState } from 'react';
import { useLobby } from '@/lib/useLobby';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LobbyJoinForm() {
  const { lobby, error, isLoading, isConnected, joinLobby } = useLobby();
  const [playerName, setPlayerName] = useState('');
  const [lobbyCode, setLobbyCode] = useState('');

  const handleJoinLobby = () => {
    joinLobby(lobbyCode, playerName);
  };

  if (lobby) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>In Lobby: {lobby.code}</CardTitle>
          <CardDescription>Waiting for host to start the game</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Join Lobby</CardTitle>
        <CardDescription>
          {isConnected ? 'Connected to server' : 'Connecting...'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="lobbyCode">Lobby Code</Label>
          <Input
            id="lobbyCode"
            placeholder="Enter 6-digit code"
            value={lobbyCode}
            onChange={(e) => setLobbyCode(e.target.value.toLowerCase())}
            maxLength={6}
            disabled={!isConnected || isLoading}
          />
        </div>

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

        {error && (
          <div className="text-sm text-red-500">
            {error}
          </div>
        )}

        <Button
          onClick={handleJoinLobby}
          disabled={!isConnected || isLoading || !playerName.trim() || !lobbyCode.trim()}
          className="w-full"
        >
          {isLoading ? 'Joining...' : 'Join Lobby'}
        </Button>
      </CardContent>
    </Card>
  );
}
