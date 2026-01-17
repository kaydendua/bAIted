'use client';

import { useState } from 'react';

interface WaitingRoomProps {
  onSelectMode: (mode: 'ai' | 'manual') => void;
  lobbyId: string;
  playerName: string;
}

export default function WaitingRoom({ onSelectMode, lobbyId, playerName }: WaitingRoomProps) {
  const [selectedMode, setSelectedMode] = useState<'ai' | 'manual' | null>(null);

  const handleSelectAI = () => {
    setSelectedMode('ai');
    onSelectMode('ai');
  };

  const handleSelectManual = () => {
    setSelectedMode('manual');
    onSelectMode('manual');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <div className="inline-block bg-white rounded-lg shadow-md px-6 py-3 mb-6">
            <p className="text-sm text-gray-600">
              Lobby: <span className="font-bold text-gray-800">{lobbyId}</span> | 
              Player: <span className="font-bold text-gray-800">{playerName}</span>
            </p>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Choose Your Coding Mode
          </h1>
          <p className="text-lg text-gray-600">
            Select how you want to solve the coding problem
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* AI Mode */}
          <div
            onClick={handleSelectAI}
            className={`bg-white rounded-2xl shadow-lg p-8 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
              selectedMode === 'ai' ? 'ring-4 ring-green-500' : ''
            }`}
          >
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-10 h-10 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                AI Assistant Mode
              </h2>
              <p className="text-gray-600">
                Get AI-generated solution with one modification allowed
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm text-gray-700">
                  Auto-generates solution
                </span>
              </div>
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm text-gray-700">
                  Request one modification
                </span>
              </div>
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm text-gray-700">
                  Code locked after modification
                </span>
              </div>
            </div>

            <button
              onClick={handleSelectAI}
              className="w-full mt-6 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium transition-colors"
            >
              Use AI Assistant
            </button>
          </div>

          {/* Manual Mode */}
          <div
            onClick={handleSelectManual}
            className={`bg-white rounded-2xl shadow-lg p-8 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
              selectedMode === 'manual' ? 'ring-4 ring-blue-500' : ''
            }`}
          >
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-10 h-10 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Manual Coding Mode
              </h2>
              <p className="text-gray-600">
                Write and submit your own solution in the IDE
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm text-gray-700">
                  Full control over your code
                </span>
              </div>
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm text-gray-700">
                  Edit anytime before submission
                </span>
              </div>
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm text-gray-700">
                  Test your coding skills
                </span>
              </div>
            </div>

            <button
              onClick={handleSelectManual}
              className="w-full mt-6 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition-colors"
            >
              Code Manually
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}