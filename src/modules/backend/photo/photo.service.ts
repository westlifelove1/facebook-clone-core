import { Inject, Injectable, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { Repository } from 'typeorm';
import { Photo } from './entities/photo.entity';
@Injectable()
export class PhotoService {
 
  
  constructor(
    @InjectRepository(Photo) private photoRepository: Repository<Photo>,

  ) {}

   findByUserId(userId: number, type: number, page: number, limit: number) {
    return this.photoRepository.find({
      where: { user: { id: userId }, isType: type },  
      relations: ['post', 'user'],
      skip: page ? (page - 1) * limit : 0,
      take: limit ? limit : 10,
    });
  } 

  findByPostId(postId: number) {
    return this.photoRepository.find({
      where: { post: { id: postId } },
      relations: ['post'],
    });
  } 

  findOne(id: number) {
    return this.photoRepository.findOne({
      where: { id },      
      relations: ['post'],
    });
  }

  remove(id: number) {
    return `This action removes a #${id} photo`;
  }
}
