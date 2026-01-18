// useGamePhase.ts
import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../lib/socket';

export type GamePhase = 'reading' | 'coding' | 'voting' | 'results';

interface PhaseData {
  phase: GamePhase;
  duration: number;
  startsAt: number;
  problem?: string; // Problem sent from server
}

interface CodeSubmission {
  playerId: string;
  playerName: string;
  code: string;
  submittedAt: number;
}

export function useGamePhase() {
  const { socket } = useSocket();
  const [currentPhase, setCurrentPhase] = useState<GamePhase | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submittedCount, setSubmittedCount] = useState(0);
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [submissions, setSubmissions] = useState<CodeSubmission[]>([]);
  const [problem, setProblem] = useState<string>('');

  useEffect(() => {
    if (!socket) return;

    // Phase started
    socket.on('phase-started', (data: PhaseData) => {
      console.log('Phase started:', data.phase);
      setCurrentPhase(data.phase);
      setTimeRemaining(data.duration);
      
      // Set problem if included (same for all players)
      if (data.problem) {
        setProblem(data.problem);
      }
      
      // Reset submission state for new phase
      if (data.phase === 'coding') {
        setHasSubmitted(false);
        setSubmittedCount(0);
      }

      // Start countdown timer
      const interval = setInterval(() => {
        const elapsed = Date.now() - data.startsAt;
        const remaining = Math.max(0, data.duration - elapsed);
        setTimeRemaining(remaining);

        if (remaining === 0) {
          clearInterval(interval);
        }
      }, 100);

      return () => clearInterval(interval);
    });

    // Code submitted confirmation
    socket.on('code-submitted', () => {
      setHasSubmitted(true);
    });

    // Submission update
    socket.on('submission-update', (data: { submittedCount: number; totalPlayers: number }) => {
      setSubmittedCount(data.submittedCount);
      setTotalPlayers(data.totalPlayers);
    });

    // Coding phase ended
    socket.on('coding-phase-ended', (data: { submissions: CodeSubmission[] }) => {
      console.log('Coding phase ended, submissions:', data.submissions);
      setSubmissions(data.submissions);
    });

    return () => {
      socket.off('phase-started');
      socket.off('code-submitted');
      socket.off('submission-update');
      socket.off('coding-phase-ended');
    };
  }, [socket]);

  const submitCode = useCallback((lobbyCode: string, code: string) => {
    if (!socket) return;
    
    socket.emit('submit-code', { lobbyCode, code });
  }, [socket]);

  const startReadingPhase = useCallback((lobbyCode: string) => {
    if (!socket) return;
    
    socket.emit('start-reading-phase', { lobbyCode });
  }, [socket]);

  return {
    currentPhase,
    timeRemaining,
    hasSubmitted,
    submittedCount,
    totalPlayers,
    submissions,
    problem,
    submitCode,
    startReadingPhase,
  };
}