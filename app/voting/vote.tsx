import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../../lib/socket';

interface VoteCount {
  playerId: string;
  playerName: string;
  votes: number;
}

export function useVote(lobbyCode: string | null) {
  const { socket, isConnected } = useSocket();
  const [myVote, setMyVote] = useState<string | null>(null);
  const [voteCounts, setVoteCounts] = useState<VoteCount[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [error, setError] = useState<string>('');

  // Listen for vote events
  useEffect(() => {
    if (!socket) return;

    // Vote confirmed
    socket.on('vote-confirmed', (data: { voterId: string; votedForId: string; votedForName: string }) => {
      console.log(`Vote confirmed for ${data.votedForName}`);
      setMyVote(data.votedForId);
      setError('');
    });

    // Vote update (broadcast to all)
    socket.on('vote-update', (data: { voteCounts: VoteCount[]; totalVotes: number }) => {
      console.log('Vote counts updated:', data.voteCounts);
      setVoteCounts(data.voteCounts);
      setTotalVotes(data.totalVotes);
    });

    // Vote counts response
    socket.on('vote-counts', (data: { voteCounts: VoteCount[] }) => {
      setVoteCounts(data.voteCounts);
    });

    // Errors
    socket.on('error', (data: { message: string }) => {
      if (data.message.includes('vote') || data.message.includes('Voting')) {
        setError(data.message);
      }
    });

    return () => {
      socket.off('vote-confirmed');
      socket.off('vote-update');
      socket.off('vote-counts');
    };
  }, [socket]);

  const castVote = useCallback((votedForId: string) => {
    if (!socket || !isConnected) {
      setError('Not connected to server');
      return;
    }

    if (!lobbyCode) {
      setError('Not in a lobby');
      return;
    }

    setError('');

    socket.emit('vote', {
      lobbyCode,
      votedForId
    });
  }, [socket, isConnected, lobbyCode]);

  const getVotes = useCallback(() => {
    if (!socket || !lobbyCode) return;

    socket.emit('get-votes', { lobbyCode });
  }, [socket, lobbyCode]);

  const clearError = useCallback(() => {
    setError('');
  }, []);

  return {
    // State
    myVote,
    voteCounts,
    totalVotes,
    error,
    
    // Actions
    castVote,
    getVotes,
    clearError,

    // Computed
    hasVoted: myVote !== null,
  };
}