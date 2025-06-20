import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FriendRequest } from './entities/friendrequest.entity';
import { User } from  '../user/entities/user.entity';

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

  async unfriend(userId: number, friendId: number): Promise<string> {
    const request = await this.friendRequestRepo.findOne({
      where: [
        { sender: { id: userId }, receiver: { id: friendId }, status: 'accept' },
        { sender: { id: friendId }, receiver: { id: userId }, status: 'accept' },
      ],
      relations: ['sender', 'receiver'],
    });

    if (!request) {
      throw new NotFoundException('Friendship not found');
    }

    await this.friendRequestRepo.remove(request);

    return 'Friend removed successfully';
  }
}
