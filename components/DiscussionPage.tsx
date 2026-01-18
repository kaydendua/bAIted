'use client';

import { useState, useEffect } from 'react';
import { useLobby } from '@/lib/useLobby';
import { useSocket } from '@/lib/socket';

interface CodeSubmission {
  playerId: string;
  playerName: string;
  code: string;
}

interface VoteCount {
  playerId: string;
  playerName: string;
  votes: number;
}

export default function DiscussionPage() {
  const { lobby, socket, currentPlayer } = useLobby();
  const [codeSubmissions, setCodeSubmissions] = useState<CodeSubmission[]>([]);
  const [voteCounts, setVoteCounts] = useState<VoteCount[]>([]);
  const [selectedVote, setSelectedVote] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    if (!socket) return;

    // Listen for code submissions
    socket.on('code-submissions', (data: { submissions: CodeSubmission[] }) => {
      setCodeSubmissions(data.submissions);
    });

    // Listen for vote updates
    socket.on('vote-update', (data: { voteCounts: VoteCount[]; totalVotes: number }) => {
      setVoteCounts(data.voteCounts);
    });

    // Listen for vote confirmation
    socket.on('vote-confirmed', (data: { voterId: string; votedForId: string }) => {
      if (data.voterId === socket.id) {
        setSelectedVote(data.votedForId);
        setHasVoted(true);
      }
    });

    // Request current vote counts
    if (lobby) {
      socket.emit('get-votes', { lobbyCode: lobby.code });
    }

    return () => {
      socket.off('code-submissions');
      socket.off('vote-update');
      socket.off('vote-confirmed');
    };
  }, [socket, lobby]);

  const handleVote = (votedForId: string) => {
    if (!socket || !lobby || !currentPlayer) return;
    
    socket.emit('vote', {
      lobbyCode: lobby.code,
      votedForId
    });
  };

  const getVoteCountForPlayer = (playerId: string): number => {
    return voteCounts.find(v => v.playerId === playerId)?.votes || 0;
  };

  if (!lobby || !currentPlayer) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white text-xl">Loading...</p>
      </div>
    );
  }

  // Filter out current player from voting options
  const votablePlayers = lobby.players.filter(p => p.id !== currentPlayer.id);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">
            Discussion Phase
          </h1>
          <p className="text-xl text-gray-400">
            Review everyone's code and vote for who you think is the{' '}
            <span className="text-red-500 font-semibold">Vibe Coder</span>
          </p>
          {hasVoted && (
            <p className="text-green-400 mt-4 text-lg">
              ✓ Vote submitted! You can change your vote anytime.
            </p>
          )}
        </div>

        {/* Code Submissions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {votablePlayers.map((player) => {
            const submission = codeSubmissions.find(s => s.playerId === player.id);
            const voteCount = getVoteCountForPlayer(player.id);
            const isSelected = selectedVote === player.id;

            return (
              <div
                key={player.id}
                className={`bg-gray-900 rounded-lg border-2 transition-all ${
                  isSelected 
                    ? 'border-yellow-500 shadow-lg shadow-yellow-500/20' 
                    : 'border-gray-700'
                }`}
              >
                {/* Player Header */}
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-semibold">{player.name}</h2>
                    {voteCount > 0 && (
                      <p className="text-red-400 text-sm mt-1">
                        {voteCount} {voteCount === 1 ? 'vote' : 'votes'}
                      </p>
                    )}
                  </div>
                  {isSelected && (
                    <span className="px-3 py-1 bg-yellow-500 text-black rounded-full text-sm font-semibold">
                      Your Vote
                    </span>
                  )}
                </div>

                {/* Code Display */}
                <div className="p-4">
                  <div className="bg-black rounded-lg p-4 mb-4 overflow-x-auto">
                    <pre className="text-sm text-green-400 font-mono">
                      {submission?.code || '// No code submitted'}
                    </pre>
                  </div>

                  {/* Vote Button */}
                  <button
                    onClick={() => handleVote(player.id)}
                    disabled={isSelected}
                    className={`w-full py-3 rounded-lg font-semibold text-lg transition-all ${
                      isSelected
                        ? 'bg-yellow-600 text-black cursor-not-allowed'
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                  >
                    {isSelected ? 'Voted' : 'Vote Out'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Vote Summary */}
        <div className="mt-12 bg-gray-900 rounded-lg p-6">
          <h3 className="text-2xl font-semibold mb-4">Current Votes</h3>
          <div className="space-y-2">
            {lobby.players
              .map(player => ({
                ...player,
                votes: getVoteCountForPlayer(player.id)
              }))
              .sort((a, b) => b.votes - a.votes)
              .map(player => (
                <div key={player.id} className="flex justify-between items-center p-3 bg-gray-800 rounded">
                  <span className="font-medium">{player.name}</span>
                  <span className="text-red-400 font-semibold">
                    {player.votes} {player.votes === 1 ? 'vote' : 'votes'}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}