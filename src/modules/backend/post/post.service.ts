import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { Comment } from '../comment/entities/comment.entity';
import { ClientProxy } from '@nestjs/microservices';
import { User } from '../user/entities/user.entity';

@Injectable()
export class PostService {

 constructor(
        @InjectRepository(Post)
        private postRepository: Repository<Post>,
        @InjectRepository(User)
        private userRepository: Repository<User>,

        @Inject('APP_SERVICE') private readonly client: ClientProxy,
    ) {}
  
  async create(createPostDto: CreatePostDto, userRequest: UserRequest) {

        const user = await this.userRepository.findOne({ where: { id: userRequest.sub } });
        if (!user) {
            throw new HttpException(`Tai khoan khong ton tai`, HttpStatus.BAD_REQUEST);
        }

        const postData = this.postRepository.create({
          content: createPostDto.content,
          isType: createPostDto.isType,
          mediaUrl: createPostDto.mediaUrl,
          user: user,
        });

        const post = await this.postRepository.save(postData);
        this.client.send('index_post', {
            index: 'post',
            document: post,
        }).subscribe(); 

        return post;
  }

  findAll() {
    return this.postRepository.find({
        relations: ['user', 'comments', 'reactions'],
        order: {
            createdAt: 'DESC'
        }
    });
  }

  findOne(id: number) {
    return this.postRepository.findOne({
      where: { id },    
      relations: ['user', 'comments', 'reactions'],
    }); 
  }

   async update(id: number, updatePostDto: UpdatePostDto): Promise<Post> {
          const post = await this.findOne(id);
          if (!post) {
              throw new Error(`Post with id ${id} not found`);
          }
          Object.assign(post, updatePostDto);
          const updatedPost = await this.postRepository.save(post);
  
          this.client.emit('index_post', {
              index: 'post',
              document: updatedPost,
          }).subscribe();
  
          return updatedPost;
      }

  async remove(id: number): Promise<void> {
      const post = await this.findOne(id);
      if (!post) {
          throw new Error(`Post with id ${id} not found`);
      }
      await this.postRepository.remove(post);
      
      this.client.emit('delete_post_index', {
          postId: id,
      }).subscribe();
  }
}
