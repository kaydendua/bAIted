'use client';

import { useState, useEffect } from 'react';
import { useSocket } from '@/lib/socket';
import { useLobbyContext } from '@/lib/LobbyContext';
import { Player } from '@/lib/types';

export function useVoting() {
  const { socket } = useSocket();
  const { lobby } = useLobbyContext();
  const [votedOutPlayer, setVotedOutPlayer] = useState<Player | null>(null);
  const [showVoteResult, setShowVoteResult] = useState(false);

  useEffect(() => {
    if (!socket) return;

    // Listen for voting results
    socket.on('voting-complete', (data: { votedOutPlayerId: string }) => {
      if (!lobby) return;
      
      const player = lobby.players.find(p => p.id === data.votedOutPlayerId);
      if (player) {
        setVotedOutPlayer(player);
        setShowVoteResult(true);
      }
    });

    return () => {
      socket.off('voting-complete');
    };
  }, [socket, lobby]);

  const resetVoting = () => {
    setVotedOutPlayer(null);
    setShowVoteResult(false);
  };

  return {
    votedOutPlayer,
    showVoteResult,
    resetVoting
  };
}