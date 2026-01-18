'use client';

import TopBar from '@/components/ui/topbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function VotingDemoPage() {
  // Mock data for demo
  const mockPlayers = [
    {
      id: '1',
      name: 'Alice',
      isAi: false,
      codeSubmission: `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}`
    },
    {
      id: '2',
      name: 'Bob',
      isAi: true,
      codeSubmission: `function fibonacci(n) {
  const cache = {};
  function fib(n) {
    if (n in cache) return cache[n];
    if (n <= 1) return n;
    cache[n] = fib(n - 1) + fib(n - 2);
    return cache[n];
  }
  return fib(n);
}`
    },
    {
      id: '3',
      name: 'Charlie',
      isAi: false,
      codeSubmission: `const fibonacci = (n) => {
  let a = 0, b = 1;
  for (let i = 0; i < n; i++) {
    [a, b] = [b, a + b];
  }
  return a;
}`
    },
  ];

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
              {mockPlayers.map((player) => (
                <Card 
                  key={player.id}
                  className="cursor-pointer transition-all hover:border-primary/50"
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
              ))}
            </div>
          </section>

          {/* Voting Section - Before Vote */}
          <section className="sticky bottom-0 bg-background/95 backdrop-blur border-t pt-8 mb-12">
            <Card>
              <CardHeader>
                <CardTitle>Cast Your Vote</CardTitle>
                <CardDescription>
                  Select a player to vote for
                </CardDescription>
              </CardHeader>
              <CardContent className="flex gap-4">
                <Button
                  variant="default"
                  size="lg"
                  disabled
                  className="flex-1"
                >
                  Submit Vote
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1"
                >
                  Clear Selection
                </Button>
              </CardContent>
            </Card>
          </section>

          {/* Voting Section - After Vote */}
          <section className="sticky bottom-0 bg-background/95 backdrop-blur border-t pt-8">
            {/* Vote Confirmation - Shown when already voted */}
            <Card className="border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-900 mb-4">
              <CardContent className="flex items-center gap-3 py-4">
                <CheckCircle2 className="text-green-600 dark:text-green-400 flex-shrink-0" size={24} />
                <div>
                  <p className="font-semibold text-green-900 dark:text-green-100">Vote Submitted</p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    You voted for Bob
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Vote Already Submitted - Error when trying to vote again */}
            <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900">
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
          </section>
        </div>
      </main>
    </>
  );
}
