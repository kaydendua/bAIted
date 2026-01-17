'use client';

import { useState } from 'react';

export default function DualChat() {
  // User prompt option
  const [userPrompt, setUserPrompt] = useState('');
  const [userResponse, setUserResponse] = useState('');
  const [userLoading, setUserLoading] = useState(false);

  // Fixed context option
  const [fixedResponse, setFixedResponse] = useState('');
  const [fixedLoading, setFixedLoading] = useState(false);

  const handleUserSubmit = async () => {
    if (!userPrompt.trim()) return;
    
    setUserLoading(true);
    setUserResponse('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userPrompt }),
      });

      const data = await res.json();
      setUserResponse(data.response);
    } catch (error) {
      console.error('Error:', error);
      setUserResponse('Error: Failed to get response');
    } finally {
      setUserLoading(false);
    }
  };

  const handleFixedSubmit = async () => {
    setFixedLoading(true);
    setFixedResponse('');

    try {
      const res = await fetch('/api/number', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();
      setFixedResponse(data.response);
    } catch (error) {
      console.error('Error:', error);
      setFixedResponse('Error: Failed to get response');
    } finally {
      setFixedLoading(false);
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

      // Code blocks
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          // End code block
          elements.push(
            <pre key={i} className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-3">
              <code>{codeContent.join('\n')}</code>
            </pre>
          );
          codeContent = [];
          inCodeBlock = false;
        } else {
          // Start code block
          inCodeBlock = true;
        }
        continue;
      }

      if (inCodeBlock) {
        codeContent.push(line);
        continue;
      }

      // Headers
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

      // Bullet points
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        elements.push(<li key={i} className="ml-6 mb-1 list-disc">{line.replace(/^[\s\-\*]+/, '')}</li>);
        continue;
      }

      // Bold text and inline code
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

      // Regular paragraph or empty line
      if (line.trim()) {
        elements.push(<p key={i} className="mb-2">{line}</p>);
      } else {
        elements.push(<br key={i} />);
      }
    }

    return elements;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* USER PROMPT SECTION */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">Chat with AI</h2>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex gap-3">
              <input
                type="text"
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleUserSubmit()}
                placeholder="Ask me anything..."
                disabled={userLoading}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
              <button
                onClick={handleUserSubmit}
                disabled={userLoading || !userPrompt.trim()}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
              >
                {userLoading ? 'Thinking...' : 'Send'}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 min-h-[200px]">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Response:</h3>
            {userLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
              </div>
            ) : userResponse ? (
              <div className="text-gray-800 leading-relaxed">
                {formatResponse(userResponse)}
              </div>
            ) : (
              <p className="text-gray-400 italic text-center py-12">
                Type a message to start chatting...
              </p>
            )}
          </div>
        </div>

        {/* DIVIDER */}
        <div className="border-t-2 border-gray-300"></div>

        {/* FIXED CONTEXT SECTION */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">Fixed Context AI</h2>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <button
              onClick={handleFixedSubmit}
              disabled={fixedLoading}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              {fixedLoading ? 'Processing...' : 'Get AI Response'}
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 min-h-[200px]">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">AI Response:</h3>
            {fixedLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500"></div>
              </div>
            ) : fixedResponse ? (
              <div className="text-gray-800 leading-relaxed">
                {formatResponse(fixedResponse)}
              </div>
            ) : (
              <p className="text-gray-400 italic text-center py-12">
                Click the button above to get AI response...
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}