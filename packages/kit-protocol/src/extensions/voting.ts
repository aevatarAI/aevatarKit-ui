/**
 * ============================================================================
 * Voting Extension Events
 * ============================================================================
 * Event names: aevatar.voting, aevatar.consensus
 * ============================================================================
 */

export interface AevatarVotingEvent {
  /** Voting round number */
  round: number;
  
  /** Total rounds expected */
  totalRounds?: number;
  
  /** Candidates being voted on */
  candidates: VotingCandidate[];
  
  /** Whether consensus has been reached */
  consensusReached: boolean;
  
  /** Voting progress (0-100) */
  progress?: number;
}

export interface VotingCandidate {
  id: string;
  content: string;
  votes: number;
  voters?: string[];
  score?: number;
  reasoning?: string;
}

export interface AevatarConsensusEvent {
  /** Final voting round */
  round: number;
  
  /** Winning candidate ID */
  leaderId: string;
  
  /** Winning candidate content */
  leaderContent: string;
  
  /** Total votes received */
  totalVotes: number;
  
  /** Vote distribution */
  voteDistribution: Record<string, number>;
  
  /** Consensus strength (0-1) */
  consensusStrength?: number;
}

