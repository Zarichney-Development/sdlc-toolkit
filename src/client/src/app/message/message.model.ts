
export interface Response {
  sessionId: string;
  message?: string | null;
  userId?: string | null;
  timestamp: string;
  modelName: string;
}
