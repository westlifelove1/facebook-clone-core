import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository, } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FriendRequest } from './entities/friendrequest.entity';
import { User } from  '../user/entities/user.entity';
import { FriendStatus } from '../../../enums/friendstatus.enum';

@Injectable()
export class FriendrequestService {

  constructor(
    @InjectRepository(FriendRequest)
    private friendRequestRepo: Repository<FriendRequest>,

    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

    async sendRequest(senderId: number, receiverId: number) {
      const sender = await this.userRepo.findOneBy({ id: senderId });
      const receiver = await this.userRepo.findOneBy({ id: receiverId });

      if (!sender || !receiver) throw new NotFoundException('User not found');

      const request = this.friendRequestRepo.create({ sender, receiver });
    return this.friendRequestRepo.save(request);
  }

  async respondRequest(senderId: number, receiverId: number, newStatus: 'accept' | 'reject',): Promise<string> {
    const request = await this.friendRequestRepo.findOne({
      where: {
        sender: { id: senderId },
        receiver: { id: receiverId },
        status: 'pending',
      },
      relations: ['sender', 'receiver'],
    });

    if (!request) {
      throw new NotFoundException('Pending friend request not found.');
    }

    request.status = newStatus;
    await this.friendRequestRepo.save(request);

    return `Friend request ${newStatus}ed successfully.`;
  }

  async getFriendList(userId: number) {
    const sent = await this.friendRequestRepo.find({
      where: { sender: { id: userId }, status: 'accept' },
      relations: ['receiver'],
    });

    const received = await this.friendRequestRepo.find({
      where: { receiver: { id: userId }, status: 'accept' },
      relations: ['sender'],
    });

    return [
      ...sent.map((r) => r.receiver),
      ...received.map((r) => r.sender),
    ];
  }

  async getPendingRequests(userId: number) {
    const received  = await this.friendRequestRepo.find({
      where: { receiver: { id: userId }, status: 'pending' },
      relations: ['sender'],
    });

    const sent  = await this.friendRequestRepo.find({
      where: { sender: { id: userId }, status: 'pending' },
      relations: ['receiver'],
    });

    return {
      received: received.map(r => ({requestId: r.id, from: r.sender, createdAt: r.createdAt, })),
      sent: sent.map(r => ({ requestId: r.id, to: r.receiver, createdAt: r.createdAt, })),
    };
  }

  async cancelOrUnfriend(userId: number, friendId: number): Promise<string> {
    const request = await this.friendRequestRepo.findOne({
      where: [
        { sender: { id: userId }, receiver: { id: friendId } },
        { sender: { id: friendId }, receiver: { id: userId } },
      ],
      relations: ['sender', 'receiver'],
    });

    if (!request) {
      throw new NotFoundException('No friend request or relationship found');
    }

    const { status } = request;

    await this.friendRequestRepo.remove(request);

    if (status === 'pending') {
      return 'Friend request canceled successfully';
    } else if (status === 'accept') {
      return 'Friend removed successfully';
    } else {
      return `Relationship with status "${status}" removed`;
    }
  }

  async getFriendStatus(userId: number, otherUserId: number): Promise<FriendStatus> {
    if (userId === otherUserId) return FriendStatus.NONE; 

    // 1. Check if user has sent a friend request to otheruser
    const sent = await this.friendRequestRepo.findOne({
      where: {
        sender: { id: userId },
        receiver: { id: otherUserId },
      },
    });

    if (sent) {
      if (sent.status === 'accept') return FriendStatus.FRIEND;
      if (sent.status === 'pending') return FriendStatus.PENDING_SENT;
    }

    // 2. Check if user has received a friend request from otheruser
    const received = await this.friendRequestRepo.findOne({
      where: {
        sender: { id: otherUserId },
        receiver: { id: userId },
      },
    });

    if (received) {
      if (received.status === 'accept') return FriendStatus.FRIEND;
      if (received.status === 'pending') return FriendStatus.PENDING_RECEIVED;
    }

    // 3. not friends
    return FriendStatus.NONE;
  }
  async friendSuggestion( currentUserId: number, page = 1, limit = 10,
  ): Promise<{ users: Partial<User>[]; total: number; page: number; limit: number }> {

    // 1. Get all sent and received friend requests of current user
    const sent = await this.friendRequestRepo.find({
      where: { sender: { id: currentUserId } },
      relations: ['receiver'],
    });

    const received = await this.friendRequestRepo.find({
      where: { receiver: { id: currentUserId } },
      relations: ['sender'],
    });

    // 2. Build exclusion list: current user + users already interacted with
    const excludedUserIds = new Set<number>();
    excludedUserIds.add(currentUserId);

    for (const req of sent) excludedUserIds.add(req.receiver.id);
    for (const req of received) excludedUserIds.add(req.sender.id);

    // 3. Query users who are not in the excluded list, are active, with pagination
    const [users, total] = await this.userRepo.createQueryBuilder('user')
      .select([
        'user.id',
        'user.fullname',
        'user.email',
        'user.profilepic',
        'user.displayname',
        'user.bio',
        'user.createdAt',
      ])
      .where('user.id NOT IN (:...excludedUserIds)', {
        excludedUserIds: Array.from(excludedUserIds),
      })
      .andWhere('user.isActive = :isActive', { isActive: true }) 
      .orderBy('user.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { users, total, page, limit, };
  }

}
