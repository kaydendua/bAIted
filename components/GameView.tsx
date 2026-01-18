'use client';

import { useState, useEffect } from 'react';
import { useLobbyContext } from '@/lib/LobbyContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, User, Code, Clock, Send } from 'lucide-react';
import { useGamePhase } from '../app/useGamePhase';
import Editor from '../app/web-ide/ide';
import { editorStore } from '../app/web-ide/editorStore';
import AIInput from '../app/web-ide/chat';

export default function GameView() {
  const { lobby, isImpostor, currentPlayer } = useLobbyContext();
  const { 
    currentPhase, 
    timeRemaining, 
    hasSubmitted, 
    submittedCount, 
    totalPlayers,
    problem,
    submissions,
    hasVoted,
    gameResults,
    submitCode,
    submitVote
  } = useGamePhase();

  const [showRoleReveal, setShowRoleReveal] = useState(true);
  const [roleRevealProgress, setRoleRevealProgress] = useState(100);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);

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
                {!problem ? (
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
      <div className="h-screen bg-black text-white flex flex-col overflow-hidden">
        {/* Top Bar with Timer and Submit */}
        <div className="w-full bg-gradient-to-r from-green-900/40 via-green-800/40 to-green-900/40 border-b-2 border-green-500/50 backdrop-blur-sm shrink-0">
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
        <div className="flex-1 w-full px-4 py-4 overflow-hidden min-h-0">
          <div className="flex gap-4 h-full">
            {/* Left: Problem */}
            <div className="w-1/4 min-w-[250px] max-w-[350px] flex flex-col">
              <Card className="bg-gray-900/70 border-gray-800 backdrop-blur-sm h-full flex flex-col overflow-hidden">
                <CardHeader className="border-b border-gray-800 shrink-0">
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    <Code className="w-5 h-5 text-blue-400" />
                    Problem
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 overflow-y-auto flex-1 min-h-0">
                  <div className="prose prose-invert prose-sm max-w-none">
                    {formatResponse(problem)}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right: Code Editor (takes remaining space) */}
            <div className="flex-1 min-w-0 flex flex-col">
              <Card className="bg-gray-900/70 border-gray-800 backdrop-blur-sm h-full flex flex-col overflow-hidden">
                <CardHeader className="border-b border-gray-800 shrink-0">
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
                <CardContent className="p-4 flex-1 overflow-hidden min-h-0">
                  <div className="h-full overflow-hidden">
                    <Editor isAI={isImpostor} />
                  </div>
                </CardContent>
                {/* AI Input at bottom of card (only for impostor) */}
                {isImpostor && <AIInput disabled={hasSubmitted} problem={problem} />}
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // VOTING PHASE (1 minute)
  if (currentPhase === 'voting') {
    const handleVote = () => {
      if (!lobby || !selectedPlayer || hasVoted) return;
      submitVote(lobby.code, selectedPlayer);
    };

    // Filter out current player from voting options (can't vote for yourself)
    const votableSubmissions = submissions.filter(s => s.playerId !== currentPlayer?.id);

    return (
      <div className="h-screen bg-black text-white flex flex-col overflow-hidden">
        {/* Top Bar with Timer */}
        <div className="w-full bg-gradient-to-r from-purple-900/40 via-purple-800/40 to-purple-900/40 border-b-2 border-purple-500/50 backdrop-blur-sm shrink-0">
          <div className="w-full px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <User className="w-7 h-7 text-purple-400" />
                  <div>
                    <h3 className="text-2xl font-bold text-purple-400">Voting Phase</h3>
                    <p className="text-purple-300/80 text-sm">
                      Find the AI impostor!
                    </p>
                  </div>
                </div>
                <div className="h-10 w-px bg-purple-500/30"></div>
                <div className="flex items-center gap-3">
                  <Clock className="w-6 h-6 text-purple-400" />
                  <span className="text-4xl font-mono font-bold text-purple-400 drop-shadow-[0_0_20px_rgba(168,85,247,0.5)]">
                    {formatTime(timeRemaining)}
                  </span>
                </div>
              </div>
              <button
                onClick={handleVote}
                disabled={hasVoted || !selectedPlayer}
                className={`px-8 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 text-lg ${
                  hasVoted
                    ? 'bg-gray-700 cursor-not-allowed text-gray-400'
                    : !selectedPlayer
                    ? 'bg-gray-700 cursor-not-allowed text-gray-400'
                    : 'bg-purple-500 hover:bg-purple-600 text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40'
                }`}
              >
                {hasVoted ? (
                  <>
                    <span className="text-2xl">✓</span>
                    <span>Vote Cast</span>
                  </>
                ) : (
                  <>
                    <User className="w-5 h-5" />
                    <span>Cast Vote</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 w-full px-4 py-4 overflow-auto">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6 text-center">
              <h2 className="text-xl text-gray-300 mb-2">Review the code submissions and vote for who you think is the AI impostor</h2>
              {isImpostor && (
                <p className="text-red-400 text-sm">You are the impostor! Try to blend in and not get caught.</p>
              )}
            </div>

            {/* Submissions Grid */}
            <div className="grid gap-4">
              {votableSubmissions.map((submission) => (
                <Card 
                  key={submission.playerId}
                  className={`bg-gray-900/70 border-2 backdrop-blur-sm cursor-pointer transition-all ${
                    selectedPlayer === submission.playerId 
                      ? 'border-purple-500 ring-2 ring-purple-500/30' 
                      : 'border-gray-800 hover:border-gray-700'
                  } ${hasVoted ? 'cursor-not-allowed opacity-70' : ''}`}
                  onClick={() => !hasVoted && setSelectedPlayer(submission.playerId)}
                >
                  <CardHeader className="border-b border-gray-800 py-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-lg flex items-center gap-2">
                        <User className="w-5 h-5 text-purple-400" />
                        {submission.playerName}
                      </CardTitle>
                      {selectedPlayer === submission.playerId && (
                        <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-xs text-purple-400">
                          Selected
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <pre className="bg-gray-950 text-gray-100 p-4 rounded-lg overflow-x-auto border border-gray-800 text-sm max-h-64 overflow-y-auto">
                      <code>{submission.code || '// No code submitted'}</code>
                    </pre>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // RESULTS PHASE
  if (currentPhase === 'results' && gameResults) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center overflow-hidden relative">
        {/* Animated background */}
        <div 
          className={`absolute inset-0 ${
            gameResults.humansWin
              ? 'bg-gradient-to-br from-green-950/50 via-emerald-950/50 to-black'
              : 'bg-gradient-to-br from-red-950/50 via-purple-950/50 to-black'
          }`}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-transparent via-black/50 to-black"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center max-w-2xl mx-auto px-6">
          {/* Result Announcement */}
          {gameResults.isTie ? (
            <div className="space-y-6">
              <div className="text-6xl mb-4">⚖️</div>
              <h1 className="text-5xl font-black text-yellow-400 tracking-tight">
                IT'S A TIE!
              </h1>
              <p className="text-xl text-yellow-300/80">
                No one was eliminated this round
              </p>
              <div className="mt-8 p-6 bg-red-900/30 border border-red-500/30 rounded-xl">
                <p className="text-red-400 text-lg">
                  The AI Impostor was <span className="font-bold text-red-300">{gameResults.aiPlayer?.name}</span>
                </p>
                <p className="text-red-300/70 mt-2">The AI wins by avoiding detection!</p>
              </div>
            </div>
          ) : gameResults.humansWin ? (
            <div className="space-y-6">
              <div className="text-6xl mb-4">🎉</div>
              <h1 className="text-5xl font-black text-green-400 tracking-tight animate-pulse">
                HUMANS WIN!
              </h1>
              <p className="text-xl text-green-300/80">
                The AI Impostor has been found!
              </p>
              <div className="mt-8 p-6 bg-green-900/30 border border-green-500/30 rounded-xl">
                <p className="text-green-400 text-lg">
                  <span className="font-bold text-green-300">{gameResults.eliminatedPlayer?.name}</span> was the AI!
                </p>
                <p className="text-green-300/70 mt-2">Great detective work!</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-6xl mb-4">🤖</div>
              <h1 className="text-5xl font-black text-red-400 tracking-tight">
                AI WINS!
              </h1>
              <p className="text-xl text-red-300/80">
                The wrong player was eliminated!
              </p>
              <div className="mt-8 space-y-4">
                <div className="p-4 bg-gray-900/50 border border-gray-700 rounded-xl">
                  <p className="text-gray-400">
                    <span className="font-bold text-gray-300">{gameResults.eliminatedPlayer?.name}</span> was eliminated
                  </p>
                  <p className="text-gray-500 text-sm mt-1">But they were human!</p>
                </div>
                <div className="p-4 bg-red-900/30 border border-red-500/30 rounded-xl">
                  <p className="text-red-400">
                    The AI was actually <span className="font-bold text-red-300">{gameResults.aiPlayer?.name}</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Vote Results */}
          <div className="mt-10">
            <h3 className="text-lg font-semibold text-gray-400 mb-4">Vote Results</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {gameResults.voteResults.sort((a, b) => b.votes - a.votes).map((result) => (
                <div 
                  key={result.playerId}
                  className={`px-4 py-2 rounded-lg border ${
                    result.wasAI 
                      ? 'bg-red-900/30 border-red-500/50 text-red-300' 
                      : result.wasEliminated
                      ? 'bg-yellow-900/30 border-yellow-500/50 text-yellow-300'
                      : 'bg-gray-800/50 border-gray-700 text-gray-300'
                  }`}
                >
                  <span className="font-medium">{result.playerName}</span>
                  <span className="ml-2 text-sm opacity-70">({result.votes} votes)</span>
                  {result.wasAI && <span className="ml-2 text-xs">🤖</span>}
                </div>
              ))}
            </div>
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