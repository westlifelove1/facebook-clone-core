import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateNotifyDto } from './dto/create-notify.dto';
import { UpdateNotifyDto } from './dto/update-notify.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notify } from './entities/notify.entity';
import { ClientProxy } from '@nestjs/microservices';
import { User } from '../user/entities/user.entity';
import { Post } from '../post/entities/post.entity';

@Injectable()
export class NotifyService {

 constructor(
        @InjectRepository(Notify)
        private notifyRepository: Repository<Notify>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @Inject('APP_SERVICE') private readonly client: ClientProxy,
        

    ) {}

  async create(createNotifyDto: CreateNotifyDto) {
        const user = await this.userRepository.findOne({ where: { id: createNotifyDto.userId } });
        if (!user) {
            throw new HttpException(`User not found`, HttpStatus.BAD_REQUEST);
        }

        const notifyData = this.notifyRepository.create({
          content: createNotifyDto.content,
          user: { id: user.id } as User,
          post: {id : createNotifyDto.PostId} as Post,
        });
        console.log('Notify data before saving:', notifyData);
        const notify = await this.notifyRepository.save(notifyData);     
        
        console.log('Notify saved:', notify);
        console.log('Notify created:', notify);
        this.client.send('index_notify', {
            index: 'notify',
            document: notify,
        }).subscribe(); 
        return notify;
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
