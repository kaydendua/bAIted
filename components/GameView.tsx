'use client';

import { useState, useEffect } from 'react';
import { useLobbyContext } from '@/lib/LobbyContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Bot, User, Code, Users, Clock, Send } from 'lucide-react';
import { useGamePhase } from '../app/useGamePhase';
import Editor from '../app/web-ide/ide';
import { editorStore } from '../app/web-ide/editorStore';
import DualChat from '../app/web-ide/chat';

export default function GameView() {
  const { lobby, isImpostor, currentPlayer } = useLobbyContext();
  const { 
    currentPhase, 
    timeRemaining, 
    hasSubmitted, 
    submittedCount, 
    totalPlayers,
    submitCode 
  } = useGamePhase();

  const [problem, setProblem] = useState('');
  const [problemLoading, setProblemLoading] = useState(false);

  console.log('GameView render - lobby:', lobby);
  console.log('GameView - isImpostor:', isImpostor);
  console.log('GameView - currentPhase:', currentPhase);

  // Fetch problem when game starts
  useEffect(() => {
    if (lobby?.status === 'in-progress' && !problem && !problemLoading) {
      fetchProblem();
    }
  }, [lobby?.status]);

  const fetchProblem = async () => {
    setProblemLoading(true);
    try {
      const res = await fetch('/api/number', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      
      if (data.error) {
        console.error('API returned error:', data.error);
        setProblem(data.response || 'Failed to load problem. Please check server configuration.');
      } else {
        setProblem(data.response);
      }
    } catch (error) {
      console.error('Error fetching problem:', error);
      setProblem('Failed to load problem. Please ensure the API is configured correctly.');
    } finally {
      setProblemLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!lobby || hasSubmitted) return;
    
    const code = editorStore.getCode();
    submitCode(lobby.code, code);
    editorStore.lock();
  };

  const formatTime = (ms: number) => {
    const seconds = Math.ceil(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatResponse = (text: string) => {
    if (!text) return null;

    const lines = text.split('\n');
    const elements = [];
    let inCodeBlock = false;
    let codeContent: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          elements.push(
            <pre key={i} className="bg-gray-950 text-gray-100 p-4 rounded-lg overflow-x-auto my-3 border border-gray-800">
              <code className="text-sm">{codeContent.join('\n')}</code>
            </pre>
          );
          codeContent = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
        }
        continue;
      }

      if (inCodeBlock) {
        codeContent.push(line);
        continue;
      }

      if (line.startsWith('### ')) {
        elements.push(<h3 key={i} className="text-lg font-bold mt-4 mb-2 text-gray-200">{line.replace(/^###\s*/, '')}</h3>);
      } else if (line.startsWith('## ')) {
        elements.push(<h2 key={i} className="text-xl font-bold mt-4 mb-2 text-gray-100">{line.replace(/^##\s*/, '')}</h2>);
      } else if (line.startsWith('# ')) {
        elements.push(<h1 key={i} className="text-2xl font-bold mt-4 mb-2 text-white">{line.replace(/^#\s*/, '')}</h1>);
      } else if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        elements.push(<li key={i} className="ml-6 mb-1 list-disc text-gray-300">{line.replace(/^[\s\-\*]+/, '')}</li>);
      } else if (line.trim()) {
        elements.push(<p key={i} className="mb-2 text-gray-300">{line}</p>);
      } else {
        elements.push(<br key={i} />);
      }
    }

    return elements;
  };

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

  // READING PHASE (20 seconds)
  if (currentPhase === 'reading') {
    return (
      <div className="min-h-screen bg-black text-white">
        {/* Role Banner */}
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

        {/* Reading Phase Content */}
        <div className="w-full px-6 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Timer Card */}
            <Card className="bg-gradient-to-r from-blue-900/50 via-blue-800/50 to-blue-900/50 border-blue-500/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="w-8 h-8 text-blue-400 animate-pulse" />
                    <div>
                      <h3 className="text-2xl font-bold text-blue-400">Reading Phase</h3>
                      <p className="text-blue-300/80 text-sm">Read the problem carefully</p>
                    </div>
                  </div>
                  <div className="text-5xl font-mono font-bold text-blue-400">
                    {formatTime(timeRemaining)}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Problem Card */}
            <Card className="bg-gray-900/70 border-gray-800 backdrop-blur-sm">
              <CardHeader className="border-b border-gray-800">
                <CardTitle className="text-white text-2xl">Coding Challenge</CardTitle>
                <CardDescription className="text-gray-400">
                  Study this problem - coding begins soon
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                {problemLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    <span className="ml-4 text-gray-400">Loading problem...</span>
                  </div>
                ) : (
                  <div className="prose prose-invert max-w-none">
                    {formatResponse(problem)}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Info Banner */}
            <Card className="bg-yellow-900/20 border-yellow-500/30 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                  <p className="text-yellow-300 font-medium">
                    Coding phase starts in {formatTime(timeRemaining)}. Get ready!
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // CODING PHASE (2 minutes)
  if (currentPhase === 'coding') {
    return (
      <div className="min-h-screen bg-black text-white">
        {/* Top Bar with Timer and Submit */}
        <div className="w-full bg-gradient-to-r from-green-900/40 via-green-800/40 to-green-900/40 border-b-2 border-green-500/50 backdrop-blur-sm">
          <div className="w-full px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <Code className="w-6 h-6 text-green-400" />
                  <div>
                    <h3 className="text-xl font-bold text-green-400">Coding Phase</h3>
                    <p className="text-green-300/80 text-sm">
                      {submittedCount}/{totalPlayers} submitted
                    </p>
                  </div>
                </div>
                <div className="h-8 w-px bg-green-500/30"></div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-green-400" />
                  <span className="text-3xl font-mono font-bold text-green-400">
                    {formatTime(timeRemaining)}
                  </span>
                </div>
              </div>
              <button
                onClick={handleSubmit}
                disabled={hasSubmitted}
                className={`px-8 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                  hasSubmitted
                    ? 'bg-gray-700 cursor-not-allowed text-gray-400'
                    : 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/20'
                }`}
              >
                {hasSubmitted ? (
                  <>
                    <span className="text-xl">✓</span>
                    <span>Submitted</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Submit Code</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full px-4 py-4">
          <div className="flex gap-4 h-[calc(100vh-140px)]">
            {/* Left: Problem */}
            <div className="w-1/4">
              <Card className="bg-gray-900/70 border-gray-800 backdrop-blur-sm h-full flex flex-col">
                <CardHeader className="border-b border-gray-800 flex-shrink-0">
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    <Code className="w-5 h-5" />
                    Problem
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 overflow-y-auto flex-1">
                  <div className="prose prose-invert prose-sm max-w-none">
                    {formatResponse(problem)}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Center: Code Editor */}
            <div className={`${isImpostor ? 'w-2/4' : 'w-3/4'}`}>
              <Card className="bg-gray-900/70 border-gray-800 backdrop-blur-sm h-full flex flex-col">
                <CardHeader className="border-b border-gray-800 flex-shrink-0">
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    <Code className="w-5 h-5" />
                    Your Solution
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Write your code here
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 flex-1 overflow-hidden">
                  <div className="h-full">
                    <Editor />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right: AI Chat (only for impostor) */}
            {isImpostor && (
              <div className="w-1/4">
                <Card className="bg-gray-900/70 border-red-800 backdrop-blur-sm h-full flex flex-col ring-1 ring-red-500/30">
                  <CardHeader className="bg-gradient-to-r from-red-900/40 to-purple-900/40 border-b border-red-800 flex-shrink-0">
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                      <Bot className="w-5 h-5 text-red-400" />
                      AI Assistant
                    </CardTitle>
                    <CardDescription className="text-red-300/80 text-xs">
                      You are the impostor!
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0 flex-1 overflow-hidden">
                    <DualChat />
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // DEFAULT VIEW (waiting/other phases)
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
                  Waiting for game phase to begin...
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="bg-gray-950/50 rounded-lg border border-gray-800 p-8 min-h-[500px] flex items-center justify-center">
                  <div className="text-center space-y-3">
                    <Clock className="w-16 h-16 text-gray-600 mx-auto animate-pulse" />
                    <p className="text-gray-500 text-lg font-medium">
                      Game Starting Soon...
                    </p>
                    <p className="text-gray-600 text-sm">
                      Get ready to code!
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