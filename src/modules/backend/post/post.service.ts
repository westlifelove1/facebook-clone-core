import { Inject, Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class PostService {
 constructor(
        @InjectRepository(Post)
        private commentRepository: Repository<Comment>,
        @InjectRepository(Post)
        private postRepository: Repository<Post>,
        @Inject('APP_SERVICE') private readonly client: ClientProxy,
    ) {}
  
  async create(createPostDto: CreatePostDto) {
        const postData = this.postRepository.create({
          content: createPostDto.content,
          
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
            relations: ['author', 'comments', 'reactions'],
            order: {
                createdAt: 'DESC'
            }
        });
  }

  findOne(id: number) {
    return this.postRepository.findOne({
      where: { id },    
      relations: ['author', 'comments', 'reactions'],
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
