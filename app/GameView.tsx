import { useState, useEffect } from 'react';
import { useLobby } from '../lib/useLobby';
import { useGamePhase } from './useGamePhase';
import Editor from './web-ide/ide';
import { editorStore } from './web-ide/editorStore';
import DualChat from './web-ide/chat';

export default function GameView() {
  const { lobby, currentPlayer } = useLobby();
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
  const isAi = currentPlayer?.isAi || false;

  // Fetch problem when game starts
  useEffect(() => {
    if (lobby?.status === 'in-progress' && !problem) {
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
      const data = await res.json();
      setProblem(data.response);
    } catch (error) {
      console.error('Error fetching problem:', error);
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
    let codeContent = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          elements.push(
            <pre key={i} className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-3">
              <code>{codeContent.join('\n')}</code>
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
        elements.push(<h3 key={i} className="text-lg font-bold mt-4 mb-2">{line.replace(/^###\s*/, '')}</h3>);
      } else if (line.startsWith('## ')) {
        elements.push(<h2 key={i} className="text-xl font-bold mt-4 mb-2">{line.replace(/^##\s*/, '')}</h2>);
      } else if (line.startsWith('# ')) {
        elements.push(<h1 key={i} className="text-2xl font-bold mt-4 mb-2">{line.replace(/^#\s*/, '')}</h1>);
      } else if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        elements.push(<li key={i} className="ml-6 mb-1 list-disc">{line.replace(/^[\s\-\*]+/, '')}</li>);
      } else if (line.trim()) {
        elements.push(<p key={i} className="mb-2">{line}</p>);
      } else {
        elements.push(<br key={i} />);
      }
    }

    return elements;
  };

  // Reading Phase View (20 seconds)
  if (currentPhase === 'reading') {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Timer */}
          <div className="bg-blue-500 text-white px-6 py-4 rounded-lg mb-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold">Reading Phase</h2>
            <div className="text-3xl font-mono font-bold">
              {formatTime(timeRemaining)}
            </div>
          </div>

          {/* Problem Display */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h3 className="text-2xl font-semibold mb-6 text-gray-700">Problem:</h3>
            {problemLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-gray-600">Loading problem...</span>
              </div>
            ) : (
              <div className="text-gray-800 leading-relaxed text-lg">
                {formatResponse(problem)}
              </div>
            )}
          </div>

          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 font-medium">
              📖 Read the problem carefully. Coding phase starts in {formatTime(timeRemaining)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Coding Phase View (2 minutes)
  if (currentPhase === 'coding') {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        {/* Timer and Submit Bar */}
        <div className="bg-green-500 text-white px-6 py-3 rounded-lg mb-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold">Coding Phase</h2>
            <span className="text-sm">
              {submittedCount}/{totalPlayers} submitted
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-2xl font-mono font-bold">
              {formatTime(timeRemaining)}
            </div>
            <button
              onClick={handleSubmit}
              disabled={hasSubmitted}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                hasSubmitted
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-white text-green-600 hover:bg-gray-100'
              }`}
            >
              {hasSubmitted ? '✓ Submitted' : 'Submit Code'}
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex gap-4 h-[calc(100vh-140px)]">
          {/* Problem (Left) */}
          <div className="w-1/4 bg-white rounded-lg shadow-md p-6 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Problem:</h3>
            <div className="text-gray-800 leading-relaxed text-sm">
              {formatResponse(problem)}
            </div>
          </div>

          {/* Code Editor (Center) */}
          <div className={`${isAi ? 'w-2/4' : 'w-3/4'} bg-white rounded-lg shadow-md p-6`}>
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Your Solution:</h3>
            <Editor />
          </div>

          {/* AI Chat (Right - only for AI player) */}
          {isAi && (
            <div className="w-1/4 bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-purple-500 text-white px-4 py-3">
                <h3 className="font-semibold">🤖 AI Assistant</h3>
                <p className="text-xs opacity-90">You are the AI!</p>
              </div>
              <div className="h-[calc(100%-60px)]">
                <DualChat />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Waiting for game to start
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg">Waiting for game to start...</p>
      </div>
    </div>
  );
}