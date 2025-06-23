import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { User } from '../user/entities/user.entity';
import { Post } from '../post/entities/post.entity';
import { ClientProxy } from '@nestjs/microservices';
import { Notify } from '../notify/entities/notify.entity';

@Injectable()
export class CommentService {
    constructor(
        @InjectRepository(Comment)
        private commentRepository: Repository<Comment>,
        @InjectRepository(Post)
        private postRepository: Repository<Post>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Notify)
        private notifyRepository: Repository<Notify>,
        @Inject('APP_SERVICE') private readonly client: ClientProxy,
    ) {}

    async create(createCommentDto: CreateCommentDto, userId: number): Promise<any> {
        const post = await this.postRepository.findOne({ where: { id: createCommentDto.postId } });
        if (!post) {
            throw new HttpException(`Bai viet khong ton tai`, HttpStatus.BAD_REQUEST);
        }
        // const user = await this.userRepository.findOne({ where: { id: userId } });
        // if (!user) {
        //     throw new HttpException(`Tai khoan khong ton tai`, HttpStatus.BAD_REQUEST);
        // }
        // console.log(JSON.stringify(user, null, 4));
        const comment = this.commentRepository.create({
            content: createCommentDto.content,
            author: { id: userId } as User,
            post: post,
        });

        if (createCommentDto.parentCommentId) {
            const parentComment = await this.commentRepository.findOne({
                where: { id: createCommentDto.parentCommentId }
            });
            if (!parentComment) {
                throw new HttpException(`Binh luan goc khong ton tai`, HttpStatus.BAD_REQUEST);
            }
            comment.parentComment = parentComment;
        }

        const newComment = await this.commentRepository.save(comment);

        // Index the comment in Elasticsearch
        this.client.send('index.comment', {
            index: 'comment',
            document: newComment,
        }).subscribe();

        const notify = this.notifyRepository.create({   
            user: { id: userId } as User,
            post: post,
            content: `User has commented to a post`,
        });
        await this.notifyRepository.save(notify);
        // Emit event to index the post

        this.client.emit('index_notify', {
            index: 'notify',
            document: notify,
        }).subscribe();

        return {
            msg: "success",
            data: newComment
        };
    }

    // async findAll(): Promise<Comment[]> {
    //     return this.commentRepository.find({
    //         relations: ['author', 'post', 'parentComment', 'replies'],
    //         order: {
    //             createdAt: 'DESC'
    //         }
    //     });
    // }

    async findOne(id: number): Promise<Comment> {
        const comment = await this.commentRepository.findOne({
            where: { id },
            relations: ['author', 'post', 'parentComment', 'replies']
        });

        if (!comment) {
            throw new HttpException(`Binh luan khong ton tai`, HttpStatus.BAD_REQUEST);
        }

        return comment;
    }

    async update(id: number, updateCommentDto: UpdateCommentDto): Promise<any> {
        const comment = await this.findOne(id);
        Object.assign(comment, updateCommentDto);
        const updatedComment = await this.commentRepository.save(comment);

        // Update the comment in Elasticsearch
        this.client.emit('index_comment', {
            index: 'comment',
            document: updatedComment,
        }).subscribe();

        return {
            msg: "success",
            data: updatedComment
        };
    }

    async remove(id: number): Promise<void> {
        const comment = await this.findOne(id);
        await this.commentRepository.remove(comment);
        
        // Delete the comment from Elasticsearch
        this.client.emit('delete.comment', {
            commentId: id,
        }).subscribe();
    }

    async getPostComments(postId: number): Promise<Comment[]> {
        return this.commentRepository.find({
            where: {
                post: { id: postId },
                parentComment: IsNull()
            },
            relations: ['author', 'replies', 'replies.author'],
            order: {
                createdAt: 'DESC',
                replies: {
                    createdAt: 'ASC'
                }
            }
        });
    }
}
