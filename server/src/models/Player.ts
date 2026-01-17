export interface Player {
  id: string;
  name: string;
  isAi: boolean;
  codeSubmission?: string;
  isReady: boolean;
  joinedAt?: Date;
}

export function createPlayer(id: string, name: string): Player {
  return {
    id,
    name,
    isAi: false,
    codeSubmission: '',
    isReady: false,
    joinedAt: new Date()
  };
}
