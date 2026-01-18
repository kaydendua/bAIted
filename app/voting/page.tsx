'use client';

import { useState, useMemo } from 'react';
import { useLobbyContext } from '@/lib/LobbyContext';
import TopBar from '@/components/ui/topbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function VotingPage() {
  const { lobby, currentPlayer, socket } = useLobbyContext();
  const [selectedVote, setSelectedVote] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [voteConfirmed, setVoteConfirmed] = useState(false);

  // Filter out current player and get players with submitted codes
  const votablePlayersWithCodes = useMemo(() => {
    if (!lobby || !currentPlayer) return [];
    
    return lobby.players.filter(
      player => player.id !== currentPlayer.id && player.codeSubmission
    );
  }, [lobby, currentPlayer]);

  const handleVote = (playerId: string) => {
    if (hasVoted) return; // Prevent voting again
    setSelectedVote(playerId);
  };

  const handleSubmitVote = () => {
    if (!selectedVote || !socket || hasVoted) return;

    // Emit vote to server (you'll need to add this event to your socket events)
    socket.emit('submit-vote', { votedPlayerId: selectedVote });
    
    setHasVoted(true);
    setVoteConfirmed(true);
    
    // Auto-dismiss confirmation after 3 seconds
    setTimeout(() => setVoteConfirmed(false), 3000);
  };

  if (!lobby || !currentPlayer) {
    return (
      <main className="flex justify-center items-center flex-col min-h-screen">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <>
      <TopBar />
      <main className="flex justify-center items-center flex-col gap-8 p-8">
        <div className="w-full max-w-4xl">
          <h1 className="text-3xl font-bold mb-2">Who is the Vibe Coder?</h1>
          <p className="text-muted-foreground mb-8">Review the submitted codes and vote for who you think is the AI</p>

          {/* Codes Display Section */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold mb-4">Player Submissions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {votablePlayersWithCodes.length > 0 ? (
                votablePlayersWithCodes.map((player) => (
                  <Card 
                    key={player.id}
                    className={`cursor-pointer transition-all ${
                      selectedVote === player.id 
                        ? 'ring-2 ring-primary border-primary' 
                        : 'hover:border-primary/50'
                    } ${hasVoted && selectedVote !== player.id ? 'opacity-60' : ''}`}
                    onClick={() => handleVote(player.id)}
                  >
                    <CardHeader>
                      <CardTitle className="text-lg">{player.name}</CardTitle>
                      <CardDescription>
                        Code Submission {player.isAi ? '(AI)' : '(Human)'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-muted p-4 rounded-lg font-mono text-sm max-h-48 overflow-y-auto">
                        <pre className="whitespace-pre-wrap break-words text-foreground/80">
                          {player.codeSubmission}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full py-8 text-center text-muted-foreground">
                  <p>Waiting for players to submit their codes...</p>
                </div>
              )}
            </div>
          </section>

          {/* Voting Section */}
          <section className="sticky bottom-0 bg-background/95 backdrop-blur border-t pt-8">
            {!hasVoted ? (
              <Card>
                <CardHeader>
                  <CardTitle>Cast Your Vote</CardTitle>
                  <CardDescription>
                    {selectedVote 
                      ? 'Click submit to confirm your vote' 
                      : 'Select a player to vote for'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex gap-4">
                  <Button
                    variant="default"
                    size="lg"
                    onClick={handleSubmitVote}
                    disabled={!selectedVote}
                    className="flex-1"
                  >
                    Submit Vote
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setSelectedVote(null)}
                    className="flex-1"
                  >
                    Clear Selection
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Vote Confirmation - Shown when already voted */}
                <Card className="border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-900">
                  <CardContent className="flex items-center gap-3 py-4">
                    <CheckCircle2 className="text-green-600 dark:text-green-400 flex-shrink-0" size={24} />
                    <div>
                      <p className="font-semibold text-green-900 dark:text-green-100">Vote Submitted</p>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        You voted for {votablePlayersWithCodes.find(p => p.id === selectedVote)?.name}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Vote Already Submitted - Error when trying to vote again */}
                <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900 mt-4">
                  <CardContent className="flex items-center gap-3 py-4">
                    <AlertCircle className="text-amber-600 dark:text-amber-400 flex-shrink-0" size={24} />
                    <div>
                      <p className="font-semibold text-amber-900 dark:text-amber-100">Vote Locked</p>
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        You can only vote once per round. Waiting for other players to vote...
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
