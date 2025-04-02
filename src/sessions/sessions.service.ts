import { Injectable } from '@nestjs/common';
import { ISessionServices } from './sessions';
import { Session, User } from 'src/utils/typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Not, Repository } from 'typeorm';

@Injectable()
export class SessionsService implements ISessionServices {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
  ) {}

  async updateSession(sessionId: string, user: User) {
    const now = Date.now();

    const session = await this.sessionRepository
      .createQueryBuilder('session')
      .where('session.id =:sessionId', { sessionId })
      .andWhere(
        "JSON_UNQUOTE(JSON_EXTRACT(session.json, '$.passport.user.id')) = :userId",
        { userId: user.id },
      )
      .andWhere('session.expiredAt > :now', { now })
      .orderBy('session.expiredAt', 'DESC')
      .getOne();

    if (!session) return;

    const data = JSON.parse(session.json);
    data.passport.user = user;

    session.json = JSON.stringify(data);
    const sessionSave = await this.sessionRepository.save(session);
    return sessionSave;
  }

  async deleteExpiredSessions() {
    const now = Date.now();

    await this.sessionRepository
      .createQueryBuilder()
      .delete()
      .from(Session)
      .where('expiredAt < :now', { now })
      .execute();

    // await this.sessionRepository.delete({
    //   expiredAt: LessThan(Date.now()),
    // });
  }

  async deleteDestroyedSessions() {
    // await this.sessionRepository.delete({ destroyedAt: Not(null) });
    await this.sessionRepository
      .createQueryBuilder()
      .delete()
      .from(Session)
      .where('destroyedAt IS NOT NULL')
      // .andWhere( "JSON_UNQUOTE(JSON_EXTRACT(json, '$.passport.user.id')) = :userId",
      //   { userId: id },)
      .execute();
  }

  async deleteOldSessionsByUserId(id: number) {
    await this.sessionRepository
      .createQueryBuilder()
      .delete()
      .from(Session)
      .where(
        "JSON_UNQUOTE(JSON_EXTRACT(json, '$.passport.user.id')) = :userId",
        { userId: id },
      )
      .execute();
  }

  async updateSessionExpiredAt(sessionID: string): Promise<Session> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionID },
    });

    const newExpiredAt = Date.now() + 86400000;

    if (!session) return;
    session.expiredAt = newExpiredAt; // 1day;
    const sessionSave = await this.sessionRepository.save(session);

    return sessionSave;
  }

  async userLogout(sessionID: string) {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionID },
    });

    if (!session) {
      console.log(`Session ${sessionID} không tồn tại!`);
      return;
    }

    const res = await this.sessionRepository.delete({ id: sessionID });
  }
}
