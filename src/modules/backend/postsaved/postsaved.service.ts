import { Injectable } from '@nestjs/common';
import { CreatePostSavedDto } from './dto/create-postsaved.dto';
import { UpdatePostSavedDto } from './dto/update-postsaved.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Post } from '../post/entities/post.entity';
import { PostSaved } from './entities/postsaved.entity';

@Injectable()
export class PostSavedService {

constructor(
        @InjectRepository(PostSaved)
        private postSavedRepository: Repository<PostSaved>,
        @InjectRepository(Post)
        private postRepository: Repository<Post>,
        @InjectRepository(User)
          private userRepository: Repository<User>,
    ) {}


  create(createPostSavedDto: CreatePostSavedDto) {
    const { postId, userId } = createPostSavedDto;
    const user = this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    ;
    const post = this.postRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new Error(`Post with ID ${postId} not found`);
    }

    const postSaved = this.postSavedRepository.save({
         userId: userId,
         postId: postId,
    });
    return postSaved;
  }

  findAll(userId : number) {
    return this.postSavedRepository.find({where: { userId: userId }, relations: ['post'] });
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
