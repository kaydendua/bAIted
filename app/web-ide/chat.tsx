'use client';

import { useState, useEffect } from 'react';

export default function DualChat() {
  const [problem, setProblem] = useState('');
  const [solution, setSolution] = useState('');
  const [problemLoading, setProblemLoading] = useState(true);
  const [solutionLoading, setSolutionLoading] = useState(false);
  const [modification, setModification] = useState('');
  const [modificationUsed, setModificationUsed] = useState(false);
  const [isModifying, setIsModifying] = useState(false);

  // Auto-generate problem on page load
  useEffect(() => {
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
  }, []);

  // Auto-generate solution after problem is loaded
  useEffect(() => {
    if (problem && !problemLoading && !problem.includes('Error:')) {
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
        } catch (error) {
          console.error('Error:', error);
          setSolution('Error: Failed to get solution');
        } finally {
          setSolutionLoading(false);
        }
      };

      fetchSolution();
    }
  }, [problem, problemLoading]);

  const handleModificationSubmit = async () => {
    if (!modification.trim() || modificationUsed) return;
    
    setIsModifying(true);
    setSolution('');

    try {
      // Get modified solution
      const res = await fetch('/api/number', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ getSolution: true, modification }),
      });

      const data = await res.json();
      setSolution(data.response);
      
      setModificationUsed(true);
    } catch (error) {
      console.error('Error:', error);
      setSolution('Error: Failed to get modified solution');
    } finally {
      setIsModifying(false);
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

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* PROBLEM SECTION */}
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

        {/* SOLUTION SECTION */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">Solution</h2>
          
          <div className="bg-white rounded-lg shadow-md p-6 min-h-[200px]">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">AI Solution:</h3>
            {solutionLoading || isModifying ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500"></div>
                <span className="ml-3 text-gray-600">
                  {isModifying ? 'Modifying solution...' : 'Generating solution...'}
                </span>
              </div>
            ) : solution ? (
              <div className="text-gray-800 leading-relaxed">
                {formatResponse(solution)}
              </div>
            ) : (
              <p className="text-gray-400 italic text-center py-12">
                Waiting for solution...
              </p>
            )}
          </div>

          {/* Modification Input */}
          {!solutionLoading && solution && !modificationUsed && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-sm text-gray-600 mb-3">
                You can request ONE modification to the solution:
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
                ✓ Modification applied! This is the final version.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}