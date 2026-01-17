'use client';

import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import WaitingRoom from '../../components/WaitingRoom';
import { editorStore } from './editorStore';
import { submitCode, unlockEditor } from './submit';

let socket: Socket;

export default function DualChat() {
  const [mode, setMode] = useState<'ai' | 'manual' | null>(null);
  const [problem, setProblem] = useState('');
  const [solution, setSolution] = useState('');
  const [userCode, setUserCode] = useState('');
  const [problemLoading, setProblemLoading] = useState(false);
  const [solutionLoading, setSolutionLoading] = useState(false);
  const [modification, setModification] = useState('');
  const [modificationUsed, setModificationUsed] = useState(false);
  const [isModifying, setIsModifying] = useState(false);
  
  // Socket states
  const [lobbyId, setLobbyId] = useState('');
  const [playerId, setPlayerId] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submissionCount, setSubmissionCount] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  // Initialize socket
  useEffect(() => {
    socket = io('http://localhost:3001');

    socket.on('connected', ({ socketId }) => {
      setPlayerId(socketId);
      console.log('Connected with ID:', socketId);
    });

    socket.on('submissionReceived', (data) => {
      console.log('Submission received:', data);
      setSubmissionCount(data.totalSubmissions);
    });

    socket.on('allSubmissionsReceived', () => {
      console.log('All players submitted!');
      alert('All players have submitted their code!');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Auto-generate problem when AI mode is selected
  useEffect(() => {
    if (mode === 'ai') {
      setProblemLoading(true);
      const fetchProblem = async () => {
        try {
          const res = await fetch('/api/number', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
          });

          const data = await res.json();
          setProblem(data.response);
        } catch (error) {
          console.error('Error:', error);
          setProblem('Error: Failed to get problem');
        } finally {
          setProblemLoading(false);
        }
      };

      fetchProblem();
    }
  }, [mode]);

  // Auto-generate solution after problem is loaded (AI mode only)
  useEffect(() => {
    if (mode === 'ai' && problem && !problemLoading && !problem.includes('Error:')) {
      const fetchSolution = async () => {
        setSolutionLoading(true);
        try {
          const res = await fetch('/api/number', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ getSolution: true }),
          });

          const data = await res.json();
          setSolution(data.response);
          
          // Extract code from markdown
          const codeMatch = data.response.match(/```[\w]*\n([\s\S]*?)```/);
          const extractedCode = codeMatch ? codeMatch[1] : data.response;
          
          setUserCode(extractedCode);
          editorStore.setCode(extractedCode);
          editorStore.lock();
          setIsLocked(true);
        } catch (error) {
          console.error('Error:', error);
          setSolution('Error: Failed to get solution');
        } finally {
          setSolutionLoading(false);
        }
      };

      fetchSolution();
    }
  }, [mode, problem, problemLoading]);

  const handleModificationSubmit = async () => {
    if (!modification.trim() || modificationUsed) return;
    
    setIsModifying(true);
    setSolution('');
    editorStore.unlock();
    setIsLocked(false);

    try {
      const res = await fetch('/api/number', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ getSolution: true, modification }),
      });

      const data = await res.json();
      setSolution(data.response);
      
      // Extract code from markdown
      const codeMatch = data.response.match(/```[\w]*\n([\s\S]*?)```/);
      const extractedCode = codeMatch ? codeMatch[1] : data.response;
      
      setUserCode(extractedCode);
      editorStore.setCode(extractedCode);
      editorStore.lock();
      setIsLocked(true);
      setModificationUsed(true);
    } catch (error) {
      console.error('Error:', error);
      setSolution('Error: Failed to get modified solution');
    } finally {
      setIsModifying(false);
    }
  };

  // Submit code to server
  const handleSubmitCode = () => {
    if (!lobbyId) {
      alert('Please enter a lobby ID!');
      return;
    }

    const codeToSubmit = mode === 'manual' ? submitCode() : editorStore.getCode();

    socket.emit('submitCode', {
      lobbyId,
      playerId,
      code: codeToSubmit
    });

    setSubmitted(true);
    alert('Code submitted successfully!');
  };

  const handleCodeChange = (value: string) => {
    if (!isLocked) {
      setUserCode(value);
      editorStore.setCode(value);
    }
  };

  // Function to format markdown response
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
        continue;
      }
      if (line.startsWith('## ')) {
        elements.push(<h2 key={i} className="text-xl font-bold mt-4 mb-2">{line.replace(/^##\s*/, '')}</h2>);
        continue;
      }
      if (line.startsWith('# ')) {
        elements.push(<h1 key={i} className="text-2xl font-bold mt-4 mb-2">{line.replace(/^#\s*/, '')}</h1>);
        continue;
      }

      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        elements.push(<li key={i} className="ml-6 mb-1 list-disc">{line.replace(/^[\s\-\*]+/, '')}</li>);
        continue;
      }

      if (line.includes('**') || line.includes('`')) {
        const formatted = line
          .split(/(\*\*.*?\*\*|`.*?`)/)
          .map((part, idx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={idx}>{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith('`') && part.endsWith('`')) {
              return <code key={idx} className="bg-gray-200 px-1.5 py-0.5 rounded text-sm font-mono">{part.slice(1, -1)}</code>;
            }
            return part;
          });
        elements.push(<p key={i} className="mb-2">{formatted}</p>);
        continue;
      }

      if (line.trim()) {
        elements.push(<p key={i} className="mb-2">{line}</p>);
      } else {
        elements.push(<br key={i} />);
      }
    }

    return elements;
  };

  // Show waiting room if no mode selected
  if (!mode) {
    return <WaitingRoom onSelectMode={setMode} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Mode Badge */}
        <div className="flex justify-between items-center">
          <div className={`px-4 py-2 rounded-full font-medium ${
            mode === 'ai' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
          }`}>
            {mode === 'ai' ? '🤖 AI Assistant Mode' : '💻 Manual Coding Mode'}
          </div>
          <button
            onClick={() => {
              setMode(null);
              setProblem('');
              setSolution('');
              setUserCode('');
              setSubmitted(false);
              setModificationUsed(false);
              editorStore.unlock();
              setIsLocked(false);
            }}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            ← Change Mode
          </button>
        </div>

        {/* Lobby Info */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Lobby Information</h2>
          <div className="flex gap-4">
            <input
              type="text"
              value={lobbyId}
              onChange={(e) => setLobbyId(e.target.value)}
              placeholder="Enter Lobby ID"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
            />
            <div className="px-4 py-2 bg-gray-100 rounded-lg">
              Player ID: {playerId || 'Connecting...'}
            </div>
            <div className="px-4 py-2 bg-blue-100 rounded-lg">
              Submissions: {submissionCount}
            </div>
          </div>
        </div>

        {/* PROBLEM SECTION */}
        {mode === 'ai' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">Coding Problem</h2>
            
            <div className="bg-white rounded-lg shadow-md p-6 min-h-[200px]">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">Problem:</h3>
              {problemLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                  <span className="ml-3 text-gray-600">Generating problem...</span>
                </div>
              ) : problem ? (
                <div className="text-gray-800 leading-relaxed">
                  {formatResponse(problem)}
                </div>
              ) : (
                <p className="text-gray-400 italic text-center py-12">
                  Waiting for response...
                </p>
              )}
            </div>
          </div>
        )}

        {/* CODE EDITOR */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Your Code</h2>
            {isLocked && (
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                🔒 Locked
              </span>
            )}
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <textarea
              value={userCode}
              onChange={(e) => handleCodeChange(e.target.value)}
              placeholder={mode === 'manual' ? "Write your code here..." : "AI solution will appear here..."}
              disabled={isLocked}
              className={`w-full h-64 p-4 font-mono text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isLocked ? 'bg-gray-50 cursor-not-allowed' : ''
              }`}
            />
            
            <button
              onClick={handleSubmitCode}
              disabled={submitted || !lobbyId || !userCode}
              className="mt-4 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              {submitted ? 'Code Submitted ✓' : 'Submit Code'}
            </button>
          </div>

          {/* Modification Input (AI mode only) */}
          {mode === 'ai' && !solutionLoading && solution && !modificationUsed && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-sm text-gray-600 mb-3">
                You can request ONE modification to unlock and update the solution:
              </p>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={modification}
                  onChange={(e) => setModification(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleModificationSubmit()}
                  placeholder="Request a modification (e.g., 'add comments', 'make it more efficient')..."
                  disabled={isModifying}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                />
                <button
                  onClick={handleModificationSubmit}
                  disabled={isModifying || !modification.trim()}
                  className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  {isModifying ? 'Modifying...' : 'Modify'}
                </button>
              </div>
            </div>
          )}

          {modificationUsed && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-medium">
                ✓ Modification applied! Code is now locked.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}