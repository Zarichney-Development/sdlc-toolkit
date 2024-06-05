
export interface Response {
  id: string;
  sessionId: string;
  message?: string | null;
  userId?: string | null;
  timestamp: string;
  modelName: string;
}
