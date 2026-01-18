// useGamePhase.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from '../lib/socket';

export type GamePhase = 'reading' | 'coding' | 'voting' | 'results';

interface PhaseData {
  phase: GamePhase;
  duration: number;
  startsAt: number;
  problem?: string; // Problem sent from server
  submissions?: CodeSubmission[]; // Submissions for voting phase
  results?: GameResults; // Results for results phase
}

interface CodeSubmission {
  playerId: string;
  playerName: string;
  code: string;
  submittedAt: number;
}

interface VoteResult {
  playerId: string;
  playerName: string;
  votes: number;
  wasEliminated: boolean;
  wasAI: boolean;
}

interface GameResults {
  isTie: boolean;
  eliminatedPlayer: { id: string; name: string; wasAI: boolean } | null;
  aiPlayer: { id: string; name: string } | null;
  voteResults: VoteResult[];
  humansWin: boolean;
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
  const [hasVoted, setHasVoted] = useState(false);
  const [gameResults, setGameResults] = useState<GameResults | null>(null);
  
  // Use refs to store timer data to avoid stale closures
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const phaseDataRef = useRef<{ startsAt: number; duration: number } | null>(null);

  // Separate effect for the timer countdown
  useEffect(() => {
    if (!phaseDataRef.current) return;
    
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    const { startsAt, duration } = phaseDataRef.current;
    
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startsAt;
      const remaining = Math.max(0, duration - elapsed);
      setTimeRemaining(remaining);

      if (remaining === 0 && timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }, 100);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [currentPhase]); // Re-run when phase changes

  useEffect(() => {
    if (!socket) return;

    // Phase started
    const handlePhaseStarted = (data: PhaseData) => {
      console.log('Phase started:', data.phase, data);
      
      // Store timer data in ref
      phaseDataRef.current = { startsAt: data.startsAt, duration: data.duration };
      
      setCurrentPhase(data.phase);
      setTimeRemaining(data.duration);
      
      // Set problem if included (same for all players)
      if (data.problem) {
        setProblem(data.problem);
      }
      
      // Set submissions if included (for voting phase)
      if (data.submissions) {
        setSubmissions(data.submissions);
      }
      
      // Set results if included (for results phase)
      if (data.results) {
        setGameResults(data.results);
      }
      
      // Reset submission state for new phase
      if (data.phase === 'coding') {
        setHasSubmitted(false);
        setSubmittedCount(0);
      }
      
      // Reset vote state for voting phase
      if (data.phase === 'voting') {
        setHasVoted(false);
      }
    };

    socket.on('phase-started', handlePhaseStarted);

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

  const submitVote = useCallback((lobbyCode: string, votedForId: string) => {
    if (!socket || hasVoted) return;
    
    socket.emit('vote', { lobbyCode, votedForId });
    setHasVoted(true);
  }, [socket, hasVoted]);

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
    hasVoted,
    gameResults,
    submitCode,
    submitVote,
    startReadingPhase,
  };
}