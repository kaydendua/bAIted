export interface Player {
  id: string;
  name: string;
  isImpostor: boolean;
  codeSubmission?: string;
  isReady: boolean;
  joinedAt?: Date;
}
