import { Inject, Injectable, Post } from '@nestjs/common';
import { CreatePhotoDto } from './dto/create-photo.dto';
import { UpdatePhotoDto } from './dto/update-photo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { Repository } from 'typeorm';
import { Photo } from './entities/photo.entity';
@Injectable()
export class PhotoService {
 
  
  constructor(
    @InjectRepository(Photo) private photoRepository: Repository<Photo>,
    @Inject('APP_SERVICE') private client: ClientProxy, 
  ) {}

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
