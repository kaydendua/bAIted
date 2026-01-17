export interface Player {
  id: string;
  name: string;
  isImpostor: boolean;
  codeSubmission?: string;
  isReady: boolean;
  joinedAt?: Date;
}

export function createPlayer(id: string, name: string): Player {
  return {
    id,
    name,
    isImpostor: false,
    codeSubmission: '',
    isReady: false,
    joinedAt: new Date()
  };
}
