import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { User } from '../user/entities/user.entity';
import { Post } from '../post/entities/post.entity';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class CommentService {
    constructor(
        @InjectRepository(Comment)
        private commentRepository: Repository<Comment>,
        @InjectRepository(Post)
        private postRepository: Repository<Post>,
        @Inject('APP_SERVICE') private readonly client: ClientProxy,
    ) {}

    async create(createCommentDto: CreateCommentDto, user: User): Promise<Comment> {
        const post = await this.postRepository.findOne({ where: { id: createCommentDto.postId } });
        if (!post) {
            throw new HttpException(`Bai viet khong ton tai`, HttpStatus.BAD_REQUEST);
        }

        const comment = this.commentRepository.create({
            content: createCommentDto.content,
            author: user,
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

        const savedComment = await this.commentRepository.save(comment);

        // Index the comment in Elasticsearch
        this.client.send('index_comment', {
            index: 'comment',
            document: savedComment,
        }).subscribe();

        return savedComment;
    }

    async findAll(): Promise<Comment[]> {
        return this.commentRepository.find({
            relations: ['author', 'post', 'parentComment', 'replies'],
            order: {
                createdAt: 'DESC'
            }
        });
    }

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

    async update(id: number, updateCommentDto: UpdateCommentDto): Promise<Comment> {
        const comment = await this.findOne(id);
        Object.assign(comment, updateCommentDto);
        const updatedComment = await this.commentRepository.save(comment);

        // Update the comment in Elasticsearch
        this.client.emit('index_comment', {
            index: 'comment',
            document: updatedComment,
        }).subscribe();

        return updatedComment;
    }

    async remove(id: number): Promise<void> {
        const comment = await this.findOne(id);
        await this.commentRepository.remove(comment);
        
        // Delete the comment from Elasticsearch
        this.client.emit('delete_comment_index', {
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
