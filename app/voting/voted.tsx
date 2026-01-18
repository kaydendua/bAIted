'use client';

import { useState, useEffect } from 'react';
import { useLobby } from '@/lib/useLobby';
import { Player } from '@/lib/types';

interface VoteResultProps {
  votedOutPlayer: Player;
  onContinue?: () => void;
}

export default function VoteResult({ votedOutPlayer, onContinue }: VoteResultProps) {
  const { lobby } = useLobby();
  const [typedText1, setTypedText1] = useState('');
  const [typedText2, setTypedText2] = useState('');
  const [showRole, setShowRole] = useState(false);
  const [pulseRole, setPulseRole] = useState(false);
  const [showRemaining, setShowRemaining] = useState(false);

  const playerName = votedOutPlayer.name;
  const role = votedOutPlayer.isAi ? 'AI' : 'human';
  
  // Count remaining AI players (excluding the voted out player)
  const remainingAiCount = lobby?.players.filter(
    p => p.isAi && p.id !== votedOutPlayer.id
  ).length || 0;

  const text1 = `${playerName} was voted out.`;
  const text2 = `${playerName} is `;

  useEffect(() => {
    // Type first line
    let index1 = 0;
    const timer1 = setInterval(() => {
      if (index1 <= text1.length) {
        setTypedText1(text1.slice(0, index1));
        index1++;
      } else {
        clearInterval(timer1);
        // Start typing second line
        let index2 = 0;
        const timer2 = setInterval(() => {
          if (index2 <= text2.length) {
            setTypedText2(text2.slice(0, index2));
            index2++;
          } else {
            clearInterval(timer2);
            // Show role with animation
            setTimeout(() => {
              setShowRole(true);
              setPulseRole(true);
              
              // Remove pulse after animation
              setTimeout(() => {
                setPulseRole(false);
                
                // Show remaining vibecoders
                setTimeout(() => {
                  setShowRemaining(true);
                }, 500);
              }, 800);
            }, 200);
          }
        }, 50);
      }
    }, 50);

    return () => {
      clearInterval(timer1);
    };
  }, [playerName, role]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8">
      <div className="text-center space-y-4 mb-12">
        {/* First line - typing animation */}
        <div className="text-4xl md:text-5xl text-white font-medium">
          {typedText1}
          {typedText1.length < text1.length && (
            <span className="animate-pulse">|</span>
          )}
        </div>

        {/* Second line - typing animation with role reveal */}
        <div className="text-4xl md:text-5xl text-white font-medium">
          {typedText2}
          {typedText2.length < text2.length && (
            <span className="animate-pulse">|</span>
          )}
          {showRole && (
            <span
              className={`inline-block font-bold transition-all duration-700 ${
                pulseRole ? 'scale-150' : 'scale-100'
              } ${votedOutPlayer.isAi ? 'text-red-500' : 'text-green-400'}`}
            >
              {role}
            </span>
          )}
          {showRole && '.'}
        </div>

        {/* Vibecoder remains - fade in */}
        <div
          className={`text-3xl md:text-4xl text-red-500 font-medium pt-6 transition-all duration-1000 ${
            showRemaining ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <span className="text-red-400">{remainingAiCount}</span> vibecoder
          {remainingAiCount !== 1 ? 's' : ''} remain{remainingAiCount === 1 ? 's' : ''}...
        </div>
      </div>

      {/* Continue button */}
      {showRemaining && onContinue && (
        <button
          onClick={onContinue}
          className="mt-8 px-8 py-4 bg-white text-black rounded-lg text-xl font-semibold 
                     hover:bg-gray-200 transition-all duration-300 animate-fade-in"
        >
          Continue
        </button>
      )}
    </div>
  );
}