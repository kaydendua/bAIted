export interface Player {
  id: string;
  name: string;
  isAi: boolean;
  codeSubmission?: string;
  isReady: boolean;
  joinedAt?: Date;
}
