'use client';

import { useLobby } from '@/lib/useLobby';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Bot, User } from 'lucide-react';

export default function GameView() {
  const { lobby, isImpostor, currentPlayer } = useLobby();

  console.log('GameView render - lobby:', lobby);
  console.log('GameView - isImpostor:', isImpostor);

  if (!lobby) {
    console.log('❌ GameView: No lobby found');
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p className="text-gray-600">Loading game...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (lobby.status !== 'in-progress') {
    console.log('❌ GameView: Lobby status is not in-progress:', lobby.status);
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p className="text-gray-600">Waiting for game to start...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  console.log('✅ GameView: Rendering game interface');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Role Banner */}
        {isImpostor ? (
          <Card className="border-red-500 bg-red-50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Bot className="w-8 h-8 text-red-600" />
                <div>
                  <CardTitle className="text-red-900">You are the AI Impostor!</CardTitle>
                  <CardDescription className="text-red-700">
                    You can use AI to help you solve the problem. Try not to get caught!
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        ) : (
          <Card className="border-blue-500 bg-blue-50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <User className="w-8 h-8 text-blue-600" />
                <div>
                  <CardTitle className="text-blue-900">You are a Human Coder!</CardTitle>
                  <CardDescription className="text-blue-700">
                    Solve the problem yourself. Find the AI impostor among the players!
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        )}

        {/* Game Info */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Lobby: {lobby.code}</CardTitle>
              <CardDescription>Game in progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm font-medium">Players:</p>
                <ul className="space-y-1">
                  {lobby.players.map((player) => (
                    <li
                      key={player.id}
                      className={`text-sm flex items-center gap-2 ${
                        player.id === currentPlayer?.id ? 'font-bold text-blue-600' : ''
                      }`}
                    >
                      {player.name}
                      {player.id === currentPlayer?.id && ' (You)'}
                      {player.isReady && ' ✓'}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>1. Solve the coding problem below</p>
              <p>2. Submit your solution when ready</p>
              <p>3. After everyone submits, vote for who you think is the AI</p>
              {isImpostor && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-900 font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Remember: You can use AI, but try to make it look natural!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Coding Editor - Load the chat component */}
        <Card>
          <CardHeader>
            <CardTitle>Coding Problem</CardTitle>
            <CardDescription>Write your solution below</CardDescription>
          </CardHeader>
          <CardContent>
            {/* This will load your existing chat/coding editor */}
            <div className="bg-gray-100 rounded-lg p-4">
              <p className="text-gray-600 text-center">
                Coding editor will be loaded here
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
