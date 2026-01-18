'use client';

import { useState } from 'react';
import { Bot, Send, Sparkles } from 'lucide-react';
import { editorStore } from './editorStore';

interface AIInputProps {
  disabled?: boolean;
  problem?: string;
}

const MAX_PROMPT_LENGTH = 50;

export default function AIInput({ disabled, problem }: AIInputProps) {
  const [modification, setModification] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  const maxUsages = 3;

  const handleSubmit = async () => {
    if (!modification.trim() || isLoading || usageCount >= maxUsages) return;
    
    setIsLoading(true);

    try {
      // Get the current code from the editor
      const currentCode = editorStore.getCode();
      
      // Build prompt with problem context
      const promptWithContext = `Problem:
${problem || 'No problem provided'}

Current code:
\`\`\`
${currentCode}
\`\`\`

User request: ${modification}`;
      
      // Ask AI to modify the code
      const res = await fetch('/api/number', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          getSolution: true, 
          modification: promptWithContext,
        }),
      });

      const data = await res.json();
      
      // Extract code from response (remove markdown code blocks if present)
      let newCode = data.response || '';
      
      // Remove markdown code block markers
      const codeMatch = newCode.match(/```(?:python|py)?\n([\s\S]*?)```/);
      if (codeMatch) {
        newCode = codeMatch[1].trim();
      } else {
        // Try to find just code without markers
        newCode = newCode.replace(/^```\w*\n?/, '').replace(/\n?```$/, '').trim();
      }
      
      // Update the editor directly
      editorStore.setCode(newCode);
      
      setUsageCount(prev => prev + 1);
      setModification('');
    } catch (error) {
      console.error('Error getting AI response:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const remainingUses = maxUsages - usageCount;

  return (
    <div className="bg-gray-900/70 border-t border-red-800 p-3 shrink-0">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-red-400" />
          <span className="text-xs text-red-300">
            AI Assistance ({remainingUses} uses left)
          </span>
        </div>
        <span className={`text-xs ${modification.length >= MAX_PROMPT_LENGTH ? 'text-red-400' : 'text-gray-500'}`}>
          {modification.length}/{MAX_PROMPT_LENGTH}
        </span>
      </div>
      
      {usageCount >= maxUsages ? (
        <div className="text-center py-2 text-red-400 text-sm">
          No more AI uses remaining
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="text"
            value={modification}
            onChange={(e) => setModification(e.target.value.slice(0, MAX_PROMPT_LENGTH))}
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="e.g. 'Solve this' or 'Add comments'"
            maxLength={MAX_PROMPT_LENGTH}
            disabled={isLoading || disabled}
            className="flex-1 px-3 py-2 bg-gray-800 border border-red-800/50 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-red-500 disabled:opacity-50"
          />
          <button
            onClick={handleSubmit}
            disabled={isLoading || !modification.trim() || disabled}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span className="text-sm">Apply</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}