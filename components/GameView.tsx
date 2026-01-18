'use client';

import { useState, useEffect } from 'react';
import { useLobbyContext } from '@/lib/LobbyContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, User, Code, Clock, Send } from 'lucide-react';
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
  const [showRoleReveal, setShowRoleReveal] = useState(true);
  const [roleRevealProgress, setRoleRevealProgress] = useState(100);

  console.log('GameView render - lobby:', lobby);
  console.log('GameView - isImpostor:', isImpostor);
  console.log('GameView - currentPhase:', currentPhase);

  // Role reveal timer (5 seconds)
  useEffect(() => {
    if (lobby?.status === 'in-progress' && showRoleReveal) {
      const startTime = Date.now();
      const duration = 5000; // 5 seconds

      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, duration - elapsed);
        const progress = (remaining / duration) * 100;
        
        setRoleRevealProgress(progress);

        if (remaining === 0) {
          clearInterval(interval);
          setShowRoleReveal(false);
        }
      }, 50);

      return () => clearInterval(interval);
    }
  }, [lobby?.status, showRoleReveal]);

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

  // ROLE REVEAL SCREEN (5 seconds)
  if (showRoleReveal) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center overflow-hidden relative">
        {/* Animated background */}
        <div className={`absolute inset-0 ${
          isImpostor 
            ? 'bg-gradient-to-br from-red-950/50 via-purple-950/50 to-black' 
            : 'bg-gradient-to-br from-blue-950/50 via-cyan-950/50 to-black'
        }`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-transparent via-black/50 to-black"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-6 max-w-2xl">
          {isImpostor ? (
            <div className="space-y-8 animate-fade-in">
              <div className="flex justify-center">
                <Bot className="w-32 h-32 text-red-500 animate-pulse drop-shadow-[0_0_30px_rgba(239,68,68,0.5)]" />
              </div>
              <div className="space-y-4">
                <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 tracking-tight animate-pulse">
                  YOU ARE THE
                </h1>
                <h2 className="text-8xl font-black text-red-500 tracking-tighter drop-shadow-[0_0_40px_rgba(239,68,68,0.8)]">
                  AI IMPOSTOR
                </h2>
              </div>
              <div className="space-y-3 max-w-lg mx-auto">
                <p className="text-2xl text-red-300 font-semibold">
                  You have access to AI assistance
                </p>
                <p className="text-lg text-red-400/80">
                  Use it wisely to blend in with the humans
                </p>
                <p className="text-sm text-red-500/60 font-mono">
                  Don't get caught...
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-fade-in">
              <div className="flex justify-center">
                <User className="w-32 h-32 text-blue-500 drop-shadow-[0_0_30px_rgba(59,130,246,0.5)]" />
              </div>
              <div className="space-y-4">
                <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 tracking-tight">
                  YOU ARE A
                </h1>
                <h2 className="text-8xl font-black text-blue-500 tracking-tighter drop-shadow-[0_0_40px_rgba(59,130,246,0.8)]">
                  HUMAN CODER
                </h2>
              </div>
              <div className="space-y-3 max-w-lg mx-auto">
                <p className="text-2xl text-blue-300 font-semibold">
                  Solve the challenge authentically
                </p>
                <p className="text-lg text-blue-400/80">
                  Then identify the AI impostor among you
                </p>
                <p className="text-sm text-blue-500/60 font-mono">
                  Trust your instincts...
                </p>
              </div>
            </div>
          )}

          {/* Progress Bar */}
          <div className="mt-12 space-y-2">
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-100 ease-linear ${
                  isImpostor 
                    ? 'bg-gradient-to-r from-red-500 to-purple-500' 
                    : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                }`}
                style={{ width: `${roleRevealProgress}%` }}
              ></div>
            </div>
            <p className="text-gray-500 text-sm font-mono">
              Game starts in {Math.ceil(roleRevealProgress / 20)}s
            </p>
          </div>
        </div>

        {/* Particle effects (optional) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-1 h-1 rounded-full ${
                isImpostor ? 'bg-red-500' : 'bg-blue-500'
              } opacity-30 animate-float`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${5 + Math.random() * 10}s`
              }}
            ></div>
          ))}
        </div>
      </div>
    );
  }

  // READING PHASE (20 seconds)
  if (currentPhase === 'reading') {
    return (
      <div className="min-h-screen bg-black text-white">
        {/* Timer Header */}
        <div className="w-full bg-gradient-to-r from-blue-900/40 via-blue-800/40 to-blue-900/40 border-b-2 border-blue-500/50 backdrop-blur-sm">
          <div className="w-full px-6 py-6">
            <div className="flex items-center justify-between max-w-6xl mx-auto">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-blue-400 animate-pulse" />
                <div>
                  <h3 className="text-2xl font-bold text-blue-400">Reading Phase</h3>
                  <p className="text-blue-300/80 text-sm">Study the problem carefully</p>
                </div>
              </div>
              <div className="text-5xl font-mono font-bold text-blue-400 drop-shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                {formatTime(timeRemaining)}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full px-6 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Problem Card */}
            <Card className="bg-gray-900/70 border-gray-800 backdrop-blur-sm">
              <CardHeader className="border-b border-gray-800">
                <CardTitle className="text-white text-2xl flex items-center gap-3">
                  <Code className="w-7 h-7" />
                  Coding Challenge
                </CardTitle>
                <CardDescription className="text-gray-400 text-base">
                  Coding begins in {formatTime(timeRemaining)}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                {problemLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    <span className="ml-4 text-gray-400 text-lg">Loading problem...</span>
                  </div>
                ) : (
                  <div className="prose prose-invert prose-lg max-w-none">
                    {formatResponse(problem)}
                  </div>
                )}
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
      <div className="min-h-screen bg-black text-white flex flex-col">
        {/* Top Bar with Timer and Submit */}
        <div className="w-full bg-gradient-to-r from-green-900/40 via-green-800/40 to-green-900/40 border-b-2 border-green-500/50 backdrop-blur-sm flex-shrink-0">
          <div className="w-full px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <Code className="w-7 h-7 text-green-400" />
                  <div>
                    <h3 className="text-2xl font-bold text-green-400">Coding Phase</h3>
                    <p className="text-green-300/80 text-sm">
                      {submittedCount}/{totalPlayers} players submitted
                    </p>
                  </div>
                </div>
                <div className="h-10 w-px bg-green-500/30"></div>
                <div className="flex items-center gap-3">
                  <Clock className="w-6 h-6 text-green-400" />
                  <span className="text-4xl font-mono font-bold text-green-400 drop-shadow-[0_0_20px_rgba(34,197,94,0.5)]">
                    {formatTime(timeRemaining)}
                  </span>
                </div>
              </div>
              <button
                onClick={handleSubmit}
                disabled={hasSubmitted}
                className={`px-8 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 text-lg ${
                  hasSubmitted
                    ? 'bg-gray-700 cursor-not-allowed text-gray-400'
                    : 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/20 hover:shadow-green-500/40'
                }`}
              >
                {hasSubmitted ? (
                  <>
                    <span className="text-2xl">✓</span>
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
        <div className="flex-1 w-full px-4 py-4 overflow-hidden">
          <div className="flex gap-4 h-full">
            {/* Left: Problem */}
            <div className="w-1/4 flex flex-col">
              <Card className="bg-gray-900/70 border-gray-800 backdrop-blur-sm h-full flex flex-col">
                <CardHeader className="border-b border-gray-800 flex-shrink-0">
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    <Code className="w-5 h-5 text-blue-400" />
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
            <div className={`${isImpostor ? 'w-2/4' : 'w-3/4'} flex flex-col`}>
              <Card className="bg-gray-900/70 border-gray-800 backdrop-blur-sm h-full flex flex-col">
                <CardHeader className="border-b border-gray-800 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white text-lg flex items-center gap-2">
                        <Code className="w-5 h-5 text-green-400" />
                        Your Solution
                      </CardTitle>
                      <CardDescription className="text-gray-400 mt-1">
                        {isImpostor ? 'You have AI assistance' : 'Code authentically'}
                      </CardDescription>
                    </div>
                    {isImpostor && (
                      <div className="px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-full">
                        <span className="text-xs font-semibold text-red-400 flex items-center gap-1">
                          <Bot className="w-3 h-3" />
                          IMPOSTOR
                        </span>
                      </div>
                    )}
                  </div>
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
              <div className="w-1/4 flex flex-col">
                <Card className="bg-gray-900/70 border-red-800 backdrop-blur-sm h-full flex flex-col ring-1 ring-red-500/30">
                  <CardHeader className="bg-gradient-to-r from-red-900/40 to-purple-900/40 border-b border-red-800 flex-shrink-0">
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                      <Bot className="w-5 h-5 text-red-400" />
                      AI Assistant
                    </CardTitle>
                    <CardDescription className="text-red-300/80 text-xs">
                      Use carefully to avoid detection
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

  // Waiting state
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center space-y-4">
        <Clock className="w-16 h-16 text-blue-500 mx-auto animate-pulse" />
        <p className="text-gray-400 text-xl">Waiting for next phase...</p>
      </div>
    </div>
  );
}