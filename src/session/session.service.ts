// src/session/session.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session, SessionStatus } from './entities/session.entity';
import { CreateSessionDto } from './dto/create-session.dto';
import { UsersService } from 'src/user/user.service';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
    private usersService: UsersService
  ) {}

  async create(createSessionDto: CreateSessionDto): Promise<Session> {
    // Verify user exists
    await this.usersService.findOne(createSessionDto.userId);

    // Check for existing active session
    const existingSession = await this.sessionRepository.findOne({
      where: { clerkSessionId: createSessionDto.clerkSessionId },
    });

    if (existingSession) {
      throw new BadRequestException('Session already exists');
    }

    const session = this.sessionRepository.create({
      ...createSessionDto,
      status: SessionStatus.ACTIVE,
      lastActivityAt: new Date(),
    });

    return this.sessionRepository.save(session);
  }

  async findByClerkId(clerkSessionId: string): Promise<Session> {
    const session = await this.sessionRepository.findOne({
      where: { clerkSessionId },
      relations: ['user'],
    });

    if (!session) {
      throw new NotFoundException(`Session not found`);
    }

    return session;
  }

  async updateActivity(clerkSessionId: string): Promise<Session> {
    const session = await this.findByClerkId(clerkSessionId);
    session.lastActivityAt = new Date();
    return this.sessionRepository.save(session);
  }

  async endSession(clerkSessionId: string): Promise<Session> {
    const session = await this.findByClerkId(clerkSessionId);

    if (session.status !== SessionStatus.ACTIVE) {
      throw new BadRequestException('Session is not active');
    }

    session.status = SessionStatus.ENDED;
    session.endedAt = new Date();

    return this.sessionRepository.save(session);
  }

  async revokeSession(clerkSessionId: string): Promise<Session> {
    const session = await this.findByClerkId(clerkSessionId);

    if (session.status === SessionStatus.REVOKED) {
      throw new BadRequestException('Session is already revoked');
    }

    session.status = SessionStatus.REVOKED;
    session.endedAt = new Date();

    return this.sessionRepository.save(session);
  }

  async getUserActiveSessions(userId: string): Promise<Session[]> {
    return this.sessionRepository.find({
      where: {
        userId,
        status: SessionStatus.ACTIVE,
      },
      order: {
        lastActivityAt: 'DESC',
      },
    });
  }

  async revokeAllUserSessions(userId: string): Promise<void> {
    const activeSessions = await this.getUserActiveSessions(userId);

    await Promise.all(
      activeSessions.map((session) =>
        this.revokeSession(session.clerkSessionId)
      )
    );
  }

  async getUserSessionsByStatus(
    userId: string,
    status: SessionStatus
  ): Promise<Session[]> {
    return this.sessionRepository.find({
      where: { userId, status },
      order: { createdAt: 'DESC' },
    });
  }

  async getUserAllSessions(userId: string): Promise<Session[]> {
    return this.sessionRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getAllActiveSessions(): Promise<Session[]> {
    return this.sessionRepository.find({
      where: { status: SessionStatus.ACTIVE },
      order: { lastActivityAt: 'DESC' },
    });
  }

  async getSessionStats() {
    const stats = await this.sessionRepository
      .createQueryBuilder('session')
      .select('session.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('session.status')
      .getRawMany();

    const activeUsers = await this.sessionRepository
      .createQueryBuilder('session')
      .select('COUNT(DISTINCT session.userId)', 'count')
      .where('session.status = :status', { status: SessionStatus.ACTIVE })
      .getRawOne();

    return {
      sessionsByStatus: stats,
      activeUsers: activeUsers.count,
    };
  }
}
