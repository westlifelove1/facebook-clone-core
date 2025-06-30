import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreatePostSavedDto } from './dto/create-postsaved.dto';
import { UpdatePostSavedDto } from './dto/update-postsaved.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Post } from '../post/entities/post.entity';
import { PostSaved } from './entities/postsaved.entity';
import { Notify } from '../notify/entities/notify.entity';
import { ClientProxy } from '@nestjs/microservices';


@Injectable()
export class PostSavedService {

constructor(
        @InjectRepository(PostSaved)
        private postSavedRepository: Repository<PostSaved>,
        @InjectRepository(Post)
        private postRepository: Repository<Post>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Notify)
        private notifyRepository: Repository<Notify>,
        @Inject('APP_SERVICE') private readonly client: ClientProxy,
    ) {}


 async  create(createPostSavedDto: CreatePostSavedDto) {
    const { postId, userId } = createPostSavedDto;
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {  
        throw new HttpException(`User not found`, HttpStatus.BAD_REQUEST);
    }
    
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new HttpException(`Post with ID ${postId} not found`, HttpStatus.BAD_REQUEST);
    }

    const postSaved = this.postSavedRepository.save({
         userId: userId,
         postId: postId,
    });
    // Create notification for the post
    const notify = this.notifyRepository.create({
       user: { id: user.id }, // Chỉ cần ID nếu không có full object
      post: { id: post.id },
      content: `Post with ID ${postId} has been saved by user with ID ${userId}`,
    });
    await this.notifyRepository.save(notify);
    // Emit event to index the post

    this.client.emit('index_notify', {
        index: 'notify',
        document: notify,
    }).subscribe();

    const postSavedData = await this.postSavedRepository.findOne({ where: { postId: postId, userId: userId }, relations: ['post', 'user'] });
    return postSavedData;
  }

  findAll(userId : number) {
    return this.postSavedRepository.find({where: { userId: userId }, relations: ['post', 'user', 'post.comments', 'post.reactions'] ,
    order: {
      updatedAt: 'DESC', 
    },});
  }

   findOne(postId: number) {
    return this.postSavedRepository.findOne({ where: { postId: postId }, relations: ['post'] });
  }

  async remove(postId: number): Promise<void> {
      const postsaved = await this.findOne(postId);
      if (!postsaved) {
          throw new Error(`Postsaved with id ${postId} not found`);
      }
      await this.postSavedRepository.remove(postsaved);
  }

  
}
