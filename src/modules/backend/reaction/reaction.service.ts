import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reaction } from './entities/reaction.entity';
import { ReactionType } from 'src/enums/reaction-type.enum';
import { CreateReactionDto } from './dto/create-reaction.dto';
import { User } from '../user/entities/user.entity';
import { Post } from '../post/entities/post.entity';
import { Notify } from '../notify/entities/notify.entity';
import { ClientProxy } from '@nestjs/microservices';
import Redis from 'ioredis';

type RedisPipeline = ReturnType<Redis['pipeline']>;

@Injectable()
export class ReactionService {
    constructor(
        @InjectRepository(Reaction)
        private reactionRepository: Repository<Reaction>,
        @InjectRepository(Post)
        private postRepository: Repository<Post>,
        @InjectRepository(Notify)
        private notifyRepository: Repository<Notify>,
        @Inject('REDIS_CLIENT') private readonly redis: Redis,
        @Inject('APP_SERVICE') private readonly client: ClientProxy,
    ) { }

    private getReactionSetKey(postId: number, reaction: string) {
        return `post:${postId}:${reaction}`;
    }

    private getReactionCountKey(postId: number): string {
        return `post:${postId}:reactions`;
    }

    async create(createReactionDto: CreateReactionDto, userId: number): Promise<any> {
        const post = await this.postRepository.findOne({ where: { id: createReactionDto.postId } });
        if (!post) {
            throw new HttpException(`Bai viet khong ton tai`, HttpStatus.BAD_REQUEST);
        }

        // Check if user already reacted to this post
        const existingReaction = await this.reactionRepository.findOne({
            where: {
                user: { id: userId },
                post: { id: post.id }
            }
        });

        let isNewReaction = false;
        let hasTypeChanged = false;
        let previousType: string | undefined;

        if (existingReaction) {
            if (existingReaction.type !== createReactionDto.type) {
                hasTypeChanged = true;
                previousType = existingReaction.type;
            }
        } else {
            isNewReaction = true;
        }

        // Only update Redis if new reaction or type changed
        if (isNewReaction || hasTypeChanged) {
            // Add to new reaction set and increment count
            await this.redis.sadd(this.getReactionSetKey(createReactionDto.postId, createReactionDto.type), userId);
            await this.redis.hincrby(this.getReactionCountKey(createReactionDto.postId), createReactionDto.type, 1);
        }
        // Remove from previous reaction set and decrement count if type changed
        if (hasTypeChanged && previousType) {
            const removed = await this.redis.srem(this.getReactionSetKey(createReactionDto.postId, previousType), userId);
            if (removed) {
                await this.redis.hincrby(this.getReactionCountKey(createReactionDto.postId), previousType, -1);
            }
        }

        // Only create notification and emit events if new reaction or type changed
        if (isNewReaction || hasTypeChanged) {
            const notify = this.notifyRepository.create({   
                user: { id: userId } as User,
                post: post,
                content: `User has reacted to a post`,
            });
            await this.notifyRepository.save(notify);
            // Emit event to index the post
            this.client.emit('index_notify', {
                index: 'notify',
                document: notify,
            }).subscribe();

            post.userId = userId; 
            this.client.emit('index_post', {
                index: 'post',
                _id : post.id.toString(),
                id: post.id,
                document: post,
            }).subscribe();
        }

        if (existingReaction) {
            if (hasTypeChanged) {
                existingReaction.type = createReactionDto.type;
                return this.reactionRepository.save(existingReaction);
            }
            // If reaction exists and type didn't change, just return it
            return existingReaction;
        } else {
            // Create new reaction
            const newReaction = this.reactionRepository.create({
                type: createReactionDto.type,
                user: { id: userId } as User,
                post
            });
            return await this.reactionRepository.save(newReaction);
        }
    }

    async findOne(id: number): Promise<Reaction> {
        const reaction = await this.reactionRepository.findOne({
            where: { id },
            relations: ['user', 'post']
        });

        if (!reaction) {
            throw new HttpException(`Reaction khong ton tai`, HttpStatus.BAD_REQUEST);
        }

        return reaction;
    }

    // async update(id: number, updateReactionDto: UpdateReactionDto): Promise<Reaction> {
    //     const reaction = await this.findOne(id);
    //     Object.assign(reaction, updateReactionDto);
    //     return this.reactionRepository.save(reaction);
    // }

    async remove(id: number): Promise<void> {
        const reaction = await this.findOne(id);
        const removed = await this.redis.srem(this.getReactionSetKey(reaction.post.id, reaction.type), reaction.user.id);
        if (removed) {
            await this.redis.hincrby(this.getReactionCountKey(reaction.post.id), reaction.type, -1);
        }
        await this.reactionRepository.remove(reaction);
    }

    // async getPostReactions(postId: number): Promise<{ type: ReactionType; count: number }[]> {
    //     const reactions = await this.reactionRepository
    //         .createQueryBuilder('reaction')
    //         .select('reaction.type', 'type')
    //         .addSelect('COUNT(*)', 'count')
    //         .where('reaction.post.id = :postId', { postId })
    //         .groupBy('reaction.type')
    //         .getRawMany();

    //     return reactions;
    // }

    async getReactions(postId: string): Promise<Record<string, string>> {
        const key = this.getReactionCountKey(<number><unknown>postId);
        return await this.redis.hgetall(key);
    }

    async getAllPostIds(): Promise<string[]> {
        const keys = await this.redis.keys('post:*:reactions');
        return keys.map(k => k.split(':')[1]); // Extract postId
    }

    async getUsersReactedToPost(postId: number): Promise<{userName: string, type: ReactionType }[]> {
        const reactions = await this.reactionRepository.find({
          where: { post: { id: postId } },
          relations: ['user'],
          select: ['id', 'type', 'user'],
        });
        return reactions.map(r => ({
          userName: r.user.fullname,
          type: r.type,
        }));
      }
}
