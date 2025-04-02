import { Session, User } from 'src/utils/typeorm';

export interface ISessionServices {
  updateSession(sessionId: string, user: User);
  deleteExpiredSessions();
  deleteOldSessionsByUserId(id: number);
  updateSessionExpiredAt(sessionID: string): Promise<Session>;

  deleteDestroyedSessions();

  userLogout(sessionID: string);
}
