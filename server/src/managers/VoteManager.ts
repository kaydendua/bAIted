import { logger } from '../utils/logger';

interface Vote {
  voterId: string;
  votedForId: string;
  timestamp: number;
}

class VoteManager {
  // Map<lobbyCode, Map<voterId, votedForId>>
  private votes: Map<string, Map<string, string>> = new Map();

  castVote(lobbyCode: string, voterId: string, votedForId: string): boolean {
    if (!this.votes.has(lobbyCode)) {
      this.votes.set(lobbyCode, new Map());
    }

    const lobbyVotes = this.votes.get(lobbyCode)!;
    
    // Replace old vote if exists
    const previousVote = lobbyVotes.get(voterId);
    lobbyVotes.set(voterId, votedForId);

    if (previousVote) {
      logger.info(`Vote updated in ${lobbyCode}: ${voterId} changed vote from ${previousVote} to ${votedForId}`);
    } else {
      logger.info(`Vote cast in ${lobbyCode}: ${voterId} voted for ${votedForId}`);
    }

    return true;
  }

  getVotes(lobbyCode: string): Map<string, string> {
    return this.votes.get(lobbyCode) || new Map();
  }

  getVoteCount(lobbyCode: string, playerId: string): number {
    const lobbyVotes = this.votes.get(lobbyCode);
    if (!lobbyVotes) return 0;

    let count = 0;
    for (const votedForId of lobbyVotes.values()) {
      if (votedForId === playerId) {
        count++;
      }
    }
    return count;
  }

  getAllVoteCounts(lobbyCode: string): Map<string, number> {
    const lobbyVotes = this.votes.get(lobbyCode);
    const counts = new Map<string, number>();

    if (!lobbyVotes) return counts;

    for (const votedForId of lobbyVotes.values()) {
      counts.set(votedForId, (counts.get(votedForId) || 0) + 1);
    }

    return counts;
  }

  clearLobbyVotes(lobbyCode: string): void {
    this.votes.delete(lobbyCode);
    logger.info(`Votes cleared for lobby ${lobbyCode}`);
  }

  getPlayerVote(lobbyCode: string, voterId: string): string | null {
    const lobbyVotes = this.votes.get(lobbyCode);
    return lobbyVotes?.get(voterId) || null;
  }
}

export const voteManager = new VoteManager();