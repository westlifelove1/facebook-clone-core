import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateFriendrequestDto } from './dto/create-friendrequest.dto';
import { UpdateFriendrequestDto } from './dto/update-friendrequest.dto';
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

  create(createFriendrequestDto: CreateFriendrequestDto) {
    return 'This action adds a new friendrequest';
  }

  findAll() {
    return `This action returns all friendrequest`;
  }

  findOne(id: number) {
    return `This action returns a #${id} friendrequest`;
  }

  update(id: number, updateFriendrequestDto: UpdateFriendrequestDto) {
    return `This action updates a #${id} friendrequest`;
  }

   async sendRequest(senderId: number, receiverId: number) {
    const sender = await this.userRepo.findOneBy({ id: senderId });
    const receiver = await this.userRepo.findOneBy({ id: receiverId });

    if (!sender || !receiver) throw new NotFoundException('User not found');

    const request = this.friendRequestRepo.create({ sender, receiver });
    return this.friendRequestRepo.save(request);
  }

  async respondRequest(id: number, status: 'accept' | 'reject') {
    const request = await this.friendRequestRepo.findOneBy({ id });
    if (!request) throw new NotFoundException('Request not found');
    request.status = status;
    return this.friendRequestRepo.save(request);
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


  remove(id: number) {
    return `This action removes a #${id} friendrequest`;
  }
}
