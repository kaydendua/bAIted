import { lobbyManager } from './LobbyManager';
import { logger } from '../utils/logger';

export type GamePhase = 'reading' | 'coding' | 'voting' | 'results';

interface PhaseTimer {
  lobbyCode: string;
  phase: GamePhase;
  timeoutId: NodeJS.Timeout;
}

interface CodeSubmission {
  playerId: string;
  code: string;
  submittedAt: number;
}

// Problem generation configuration
const PROBLEM_CONTEXT = `You are a creative coding problem generator. Generate one coding problem suitable for multiple people to attempt it and provide similar solutions with slight variations in interpretation or approach.

The general difficulty of questions will range from beginner to intermediate, but you will be given a difficulty value for the question. This difficulty value can range from 1 to 5, where the value corresponds to the number of minutes it would take for the average developer to solve it.

Requirements:
- Topic: Can be anything ranging from simple if statements to arrays or algorithms
- Language: Python focused but should be solvable in most languages
- Must include subtle edge cases or room for interpretation that could spark discussion
- Format in clean Markdown with clear structure
- Include 2-3 example test cases with inputs and expected outputs
- DO NOT provide ANY solutions, code, or implementation hints
- DO NOT explain the edge cases - let players discover them
- Keep the problem statement concise but complete

Example format:
# [Problem Title]

[Brief 1-2 sentence scenario/context]

[Clear problem description]

## Example 1:
\`\`\`
Input: [input]
Output: [output]
\`\`\`

## Example 2:
\`\`\`
Input: [input]
Output: [output]
\`\`\`

## Constraints:
- [constraint 1]
- [constraint 2]`;

class GamePhaseManager {
  private currentPhases: Map<string, GamePhase> = new Map();
  private phaseTimers: Map<string, PhaseTimer> = new Map();
  private codeSubmissions: Map<string, Map<string, CodeSubmission>> = new Map(); // lobbyCode -> playerId -> submission
  private phaseStartTimes: Map<string, number> = new Map();
  private lobbyProblems: Map<string, string> = new Map(); // Store problem per lobby

  async generateProblem(): Promise<string> {
    try {
      const apiKey = process.env.CEREBRAS_API_KEY;
      if (!apiKey) {
        logger.error('CEREBRAS_API_KEY is not set');
        return '# Error\n\nAPI key not configured. Please set CEREBRAS_API_KEY.';
      }

      const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-oss-120b',
          messages: [{
            role: 'user',
            content: `${PROBLEM_CONTEXT}\n\nGenerate a difficulty 3 coding problem. Remember: NO solutions, NO implementation hints, NO code examples in the problem description itself. Only the problem statement with test cases.`
          }],
          temperature: 0.8
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error(`API request failed with status ${response.status}: ${errorText}`);
        return `# Error\n\nAPI request failed (${response.status}). Please try again.`;
      }

      const data = await response.json() as { choices?: { message: { content: string } }[], error?: { message: string } };
      
      if (data.error) {
        logger.error('API returned error:', data.error);
        return `# Error\n\n${data.error.message || 'Unknown API error'}`;
      }

      if (!data.choices || data.choices.length === 0) {
        logger.error('API returned no choices:', JSON.stringify(data));
        return '# Error\n\nAPI returned no results. Please try again.';
      }

      return data.choices[0].message.content || 'Failed to generate problem';
    } catch (error) {
      logger.error('Error generating problem:', error);
      return '# Error\n\nFailed to generate problem. Please restart the game.';
    }
  }

  getProblem(lobbyCode: string): string | undefined {
    return this.lobbyProblems.get(lobbyCode);
  }

  async startReadingPhase(lobbyCode: string, io: any): Promise<boolean> {
    const lobby = lobbyManager.getLobby(lobbyCode);
    if (!lobby) return false;

    // Generate the problem ONCE for the entire lobby
    logger.info(`Generating problem for lobby ${lobbyCode}...`);
    const problem = await this.generateProblem();
    this.lobbyProblems.set(lobbyCode, problem);
    logger.info(`Problem generated for lobby ${lobbyCode}`);

    this.currentPhases.set(lobbyCode, 'reading');
    this.phaseStartTimes.set(lobbyCode, Date.now());

    logger.info(`Reading phase started for lobby ${lobbyCode}`);

    // Emit to all players with the SAME problem
    io.to(lobbyCode).emit('phase-started', {
      phase: 'reading',
      duration: 20000, // 20 seconds
      startsAt: Date.now(),
      problem: problem // Send problem to all players
    });

    // Set timer to auto-advance to coding phase
    const timeoutId = setTimeout(() => {
      this.startCodingPhase(lobbyCode, io);
    }, 20000);

    this.phaseTimers.set(lobbyCode, {
      lobbyCode,
      phase: 'reading',
      timeoutId
    });

    return true;
  }

  startCodingPhase(lobbyCode: string, io: any): boolean {
    const lobby = lobbyManager.getLobby(lobbyCode);
    if (!lobby) return false;

    // Clear previous timer
    this.clearTimer(lobbyCode);

    this.currentPhases.set(lobbyCode, 'coding');
    this.phaseStartTimes.set(lobbyCode, Date.now());
    this.codeSubmissions.set(lobbyCode, new Map());

    logger.info(`Coding phase started for lobby ${lobbyCode}`);

    // Get the same problem that was used in reading phase
    const problem = this.lobbyProblems.get(lobbyCode);

    // Emit to all players with the same problem
    io.to(lobbyCode).emit('phase-started', {
      phase: 'coding',
      duration: 120000, // 2 minutes
      startsAt: Date.now(),
      problem: problem // Include problem for coding phase too
    });

    // Set timer to auto-submit and advance
    const timeoutId = setTimeout(() => {
      this.endCodingPhase(lobbyCode, io);
    }, 120000);

    this.phaseTimers.set(lobbyCode, {
      lobbyCode,
      phase: 'coding',
      timeoutId
    });

    return true;
  }

  submitCode(lobbyCode: string, playerId: string, code: string): boolean {
    const submissions = this.codeSubmissions.get(lobbyCode);
    if (!submissions) return false;

    submissions.set(playerId, {
      playerId,
      code,
      submittedAt: Date.now()
    });

    logger.info(`Code submitted by player ${playerId} in lobby ${lobbyCode}`);
    return true;
  }

  checkAllSubmitted(lobbyCode: string, io: any): boolean {
    const lobby = lobbyManager.getLobby(lobbyCode);
    const submissions = this.codeSubmissions.get(lobbyCode);
    
    if (!lobby || !submissions) return false;

    // Check if all players have submitted
    const allSubmitted = lobby.players.every(player => 
      submissions.has(player.id)
    );

    if (allSubmitted) {
      logger.info(`All players submitted in lobby ${lobbyCode}, ending phase early`);
      this.endCodingPhase(lobbyCode, io);
      return true;
    }

    return false;
  }

  endCodingPhase(lobbyCode: string, io: any): void {
    const lobby = lobbyManager.getLobby(lobbyCode);
    if (!lobby) return;

    this.clearTimer(lobbyCode);

    // Auto-submit any unsubmitted code (empty string)
    const submissions = this.codeSubmissions.get(lobbyCode) || new Map();
    lobby.players.forEach(player => {
      if (!submissions.has(player.id)) {
        submissions.set(player.id, {
          playerId: player.id,
          code: '',
          submittedAt: Date.now()
        });
      }
    });

    logger.info(`Coding phase ended for lobby ${lobbyCode}`);

    // Emit all submissions to all players
    const submissionsArray = Array.from(submissions.values()).map(sub => ({
      playerId: sub.playerId,
      playerName: lobby.players.find(p => p.id === sub.playerId)?.name || 'Unknown',
      code: sub.code,
      submittedAt: sub.submittedAt
    }));

    io.to(lobbyCode).emit('coding-phase-ended', {
      submissions: submissionsArray
    });

    // Move to voting phase
    this.startVotingPhase(lobbyCode, io);
  }

  startVotingPhase(lobbyCode: string, io: any): void {
    this.currentPhases.set(lobbyCode, 'voting');
    this.phaseStartTimes.set(lobbyCode, Date.now());

    io.to(lobbyCode).emit('phase-started', {
      phase: 'voting',
      duration: 60000, // 1 minute for voting
      startsAt: Date.now()
    });

    logger.info(`Voting phase started for lobby ${lobbyCode}`);
  }

  getCurrentPhase(lobbyCode: string): GamePhase | null {
    return this.currentPhases.get(lobbyCode) || null;
  }

  getSubmissions(lobbyCode: string): Map<string, CodeSubmission> {
    return this.codeSubmissions.get(lobbyCode) || new Map();
  }

  hasSubmitted(lobbyCode: string, playerId: string): boolean {
    const submissions = this.codeSubmissions.get(lobbyCode);
    return submissions?.has(playerId) || false;
  }

  clearTimer(lobbyCode: string): void {
    const timer = this.phaseTimers.get(lobbyCode);
    if (timer) {
      clearTimeout(timer.timeoutId);
      this.phaseTimers.delete(lobbyCode);
    }
  }

  cleanup(lobbyCode: string): void {
    this.clearTimer(lobbyCode);
    this.currentPhases.delete(lobbyCode);
    this.codeSubmissions.delete(lobbyCode);
    this.phaseStartTimes.delete(lobbyCode);
    logger.info(`Cleaned up game phase data for lobby ${lobbyCode}`);
  }
}

export const gamePhaseManager = new GamePhaseManager();