import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { ClientProxy } from '@nestjs/microservices';
import { User } from '../user/entities/user.entity';
import { Notify } from '../notify/entities/notify.entity';
import { Photo } from '../photo/entities/photo.entity';
import { basename } from 'path';

@Injectable()
export class PostService {

 constructor(
        @InjectRepository(Post)
        private postRepository: Repository<Post>,
        @InjectRepository(Photo)
        private photoRepository: Repository<Photo>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Notify)
        private notifyRepository: Repository<Notify>,
        @Inject('APP_SERVICE') private readonly client: ClientProxy,
    ) {}

  private readonly allowedImageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
  async create(createPostDto: CreatePostDto, userId: number) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new HttpException(`User not found`, HttpStatus.BAD_REQUEST);
        }

        const postData = this.postRepository.create({
          content: createPostDto.content,
          isType: createPostDto.isType,
          mediaUrl: createPostDto.mediaUrl,
          friends: createPostDto.friends,
          user: user, 
        });

        const post = await this.postRepository.save(postData);
        post.userId = user.id; 
        
        //handle photos if provided
        if (createPostDto.mediaUrl && createPostDto.mediaUrl.length > 0) {
            const photos = createPostDto.mediaUrl.map(url => {
                const pathname = new URL(url).pathname; // extract /path/to/file.jpg
                const baseName = basename(pathname);     
                let isType = 0; // 0: image, 1: video 
                if (!this.isImageFile(url)) {
                    isType = 1; // If not an image, treat as video
                }
                const photoEntity = this.photoRepository.create({
                    name: baseName,
                    url: url,
                    isType: isType, // 0: image, 1: video
                    post: post,
                    user: user,
                    createdAt: new Date(),
                });
                return photoEntity;
            });
            await this.photoRepository.save(photos);
        }
        
        // Create notification for the post
        const notify = this.notifyRepository.create({   
            user: user,
            post: post,
            content: `User ${user.fullname} has created a new post`,
        });
        await this.notifyRepository.save(notify);
        // Emit event to index the post

        this.client.emit('index_notify', {
            index: 'notify',
            document: notify,
        }).subscribe();


        // console.log('Post created:', post);
        this.client.send('index_post', {
            index: 'post',
            document: post,
        }).subscribe(); 

        return post;
  }

  isImageFile(url: string): boolean {
    return /\.(jpe?g|png|gif|jpg|bmp|webp)$/i.test(url);
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

   async update(id: number, updatePostDto: UpdatePostDto, userId: number): Promise<Post> {
        const post = await this.findOne(id);
        if (!post) {
            throw new HttpException(`Post with id ${id} not found`, HttpStatus.NOT_FOUND);
        }
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {    
            throw new HttpException(`User not found`, HttpStatus.BAD_REQUEST);
        }
        if (post.user.id !== user.id) {
            throw new HttpException(`You are not allowed to update this post`, HttpStatus.FORBIDDEN);
        }

        Object.assign(post, updatePostDto);
        const updatedPost = await this.postRepository.save(post);
        
        this.client.emit('index_post', {
            index: 'post',
            document: updatedPost,
        }).subscribe();
          

        // Update notification for the post
        const notify = this.notifyRepository.create({   
            user: user,
            post: post,
            content: `User ${user.fullname} has updated a post`,
        });
        await this.notifyRepository.save(notify);
        // Emit event to index the post

        this.client.emit('index_notify', {
            index: 'notify',
            document: notify,
        }).subscribe();


          return updatedPost;
      }

  async remove(postId: number, userId: number): Promise<void> {
    const post = await this.findOne(postId);
        if (!post) {
        throw new HttpException(`Post with id ${postId} not found`, HttpStatus.NOT_FOUND);
    }
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {  
        throw new HttpException(`User not found`, HttpStatus.BAD_REQUEST);
    }
    
    if (post.user.id !== user.id) {
     throw new HttpException(`You are not allowed to delete this post`, HttpStatus.FORBIDDEN);
    }

    await this.postRepository.remove(post);

    this.client.emit('delete_post_index', {
     id: postId,
    }).subscribe();

    // Delete notification for the post
    const notify = this.notifyRepository.create({   
        user: user,
        post: post,
        content: `User ${user.fullname} has deleted a post`,
    });
    await this.notifyRepository.save(notify);
    // Emit event to index the post
    
    this.client.emit('index_notify', {
        index: 'notify',
        document: notify,
    }).subscribe();
  }
}
