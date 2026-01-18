import { Server, Socket } from 'socket.io';
import { voteManager } from '../managers/VoteManager';
import { lobbyManager } from '../managers/LobbyManager';
import { logger } from '../utils/logger';
import { gamePhaseManager } from '../managers/GamePhaseManager';

export function handleVote(
  io: Server, 
  socket: Socket, 
  data: { lobbyCode: string; votedForId: string }
) {
  try {
    const { lobbyCode, votedForId } = data;
    const voterId = socket.id;

    // Validate lobby exists
    const lobby = lobbyManager.getLobby(lobbyCode);
    if (!lobby) {
      socket.emit('error', { message: 'Lobby not found' });
      return;
    }

    // Validate game is in progress
    if (lobby.status !== 'in-progress') {
      socket.emit('error', { message: 'Voting is only allowed during the game' });
      return;
    }
    
    // Check if we're in voting phase
    if (gamePhaseManager.getCurrentPhase(lobbyCode) !== 'voting') {
      socket.emit('error', { message: 'Voting phase has ended' });
      return;
    }

    // Validate voter is in the lobby
    const voter = lobby.players.find(p => p.id === voterId);
    if (!voter) {
      socket.emit('error', { message: 'You are not in this lobby' });
      return;
    }

    // Validate voted player exists in lobby
    const votedPlayer = lobby.players.find(p => p.id === votedForId);
    if (!votedPlayer) {
      socket.emit('error', { message: 'Invalid player to vote for' });
      return;
    }

    // Can't vote for yourself
    if (voterId === votedForId) {
      socket.emit('error', { message: 'You cannot vote for yourself' });
      return;
    }

    // Cast the vote (replaces old vote if exists)
    voteManager.castVote(lobbyCode, voterId, votedForId);

    // Confirm vote to the voter
    socket.emit('vote-confirmed', {
      voterId,
      votedForId,
      votedForName: votedPlayer.name
    });

    // Get updated vote counts
    const voteCounts = voteManager.getAllVoteCounts(lobbyCode);
    const voteCountsArray = Array.from(voteCounts.entries()).map(([playerId, count]) => ({
      playerId,
      playerName: lobby.players.find(p => p.id === playerId)?.name || 'Unknown',
      votes: count
    }));

    // Broadcast vote counts to all players in lobby (without revealing who voted for whom)
    io.to(lobbyCode).emit('vote-update', {
      voteCounts: voteCountsArray,
      totalVotes: lobby.players.length - 1 // Assuming everyone except AI should vote
    });

    logger.info(`Vote cast in ${lobbyCode}: ${voter.name} voted for ${votedPlayer.name}`);
    
    // Check if all players have voted - end voting early
    const allVotes = voteManager.getVotes(lobbyCode);
    if (allVotes.size >= lobby.players.length) {
      logger.info(`All players voted in ${lobbyCode}, ending voting phase early`);
      gamePhaseManager.endVotingPhase(lobbyCode, io);
    }
  } catch (error) {
    logger.error('Error handling vote:', error);
    socket.emit('error', { message: 'Failed to cast vote' });
  }
}

export function handleGetVotes(io: Server, socket: Socket, data: { lobbyCode: string }) {
  try {
    const { lobbyCode } = data;
    const lobby = lobbyManager.getLobby(lobbyCode);

    if (!lobby) {
      socket.emit('error', { message: 'Lobby not found' });
      return;
    }

    const voteCounts = voteManager.getAllVoteCounts(lobbyCode);
    const voteCountsArray = Array.from(voteCounts.entries()).map(([playerId, count]) => ({
      playerId,
      playerName: lobby.players.find(p => p.id === playerId)?.name || 'Unknown',
      votes: count
    }));

    socket.emit('vote-counts', { voteCounts: voteCountsArray });
  } catch (error) {
    logger.error('Error getting votes:', error);
    socket.emit('error', { message: 'Failed to get votes' });
  }
}