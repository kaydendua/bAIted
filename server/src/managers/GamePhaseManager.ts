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

class GamePhaseManager {
  private currentPhases: Map<string, GamePhase> = new Map();
  private phaseTimers: Map<string, PhaseTimer> = new Map();
  private codeSubmissions: Map<string, Map<string, CodeSubmission>> = new Map(); // lobbyCode -> playerId -> submission
  private phaseStartTimes: Map<string, number> = new Map();

  startReadingPhase(lobbyCode: string, io: any): boolean {
    const lobby = lobbyManager.getLobby(lobbyCode);
    if (!lobby) return false;

    this.currentPhases.set(lobbyCode, 'reading');
    this.phaseStartTimes.set(lobbyCode, Date.now());

    logger.info(`Reading phase started for lobby ${lobbyCode}`);

    // Emit to all players
    io.to(lobbyCode).emit('phase-started', {
      phase: 'reading',
      duration: 20000, // 20 seconds
      startsAt: Date.now()
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

    // Emit to all players
    io.to(lobbyCode).emit('phase-started', {
      phase: 'coding',
      duration: 120000, // 2 minutes
      startsAt: Date.now()
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