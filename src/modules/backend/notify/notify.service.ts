import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateNotifyDto } from './dto/create-notify.dto';
import { UpdateNotifyDto } from './dto/update-notify.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notify } from './entities/notify.entity';
import { ClientProxy } from '@nestjs/microservices';
import { User } from '../user/entities/user.entity';
import { Post } from '../post/entities/post.entity';
import { differenceInCalendarISOWeekYears } from 'date-fns';

@Injectable()
export class NotifyService {

 constructor(
        @InjectRepository(Notify)
        private notifyRepository: Repository<Notify>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Post)
        private postRepository: Repository<Post>,
        @Inject('APP_SERVICE') private readonly client: ClientProxy,
        

    ) {}

  async create(createNotifyDto: CreateNotifyDto) {
        const user = await this.userRepository.findOne({ where: { id: createNotifyDto.userId }, select: ['id', 'fullname', 'email', 'profilepic', 'coverpic']  });
        if (!user) {
            throw new HttpException(`User not found`, HttpStatus.BAD_REQUEST);
        }
        const post = await this.postRepository.findOne({ where: { id: createNotifyDto.postId }, select: ['id', 'content'] });
        if (!post) {  
            throw new HttpException(`Post not found`, HttpStatus.BAD_REQUEST);
        }
        console.log(post)
        const notifyData = this.notifyRepository.create({
          content: createNotifyDto.content,
          user: { id: user.id } as User,
          post: {id : post.id} as Post,
        });
        const notify = await this.notifyRepository.save(notifyData);     
        const documentData = {
            ...notify,
            user: user,
            post: post,
        };
        this.client.send('index_notify', {
            index: 'notify',
            document: documentData,
        }).subscribe(); 
        return documentData;
  }


  findAll() {
    return this.notifyRepository.find({
        relations: ['user', 'post'],
        order: {
            createdAt: 'DESC'
        }
    });
  }

  findOne(id: number) {
    return this.notifyRepository.findOne({
      where: { id },    
      relations: ['user', 'post'],
    }); 
  }

  async remove(id: number): Promise<void> {
      const notify = await this.findOne(id);
      if (!notify) {
          throw new Error(`Notify with id ${id} not found`);
      }
      await this.notifyRepository.remove(notify);
      
      this.client.emit('delete_notify_index', {
          postId: id,
      }).subscribe();
  }
}
