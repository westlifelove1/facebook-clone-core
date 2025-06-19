import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reaction } from './entities/reaction.entity';
import { ReactionType } from 'src/enums/reaction-type.enum';
import { CreateReactionDto } from './dto/create-reaction.dto';
import { UpdateReactionDto } from './dto/update-reaction.dto';
import { User } from '../user/entities/user.entity';
import { Post } from '../post/entities/post.entity';
import { RedisService } from 'src/service/redis/redis.service';
import { Redis } from 'ioredis';


@Injectable()
export class ReactionService {
    constructor(
        @InjectRepository(Reaction)
        private reactionRepository: Repository<Reaction>,
        @InjectRepository(Post)
        private postRepository: Repository<Post>,
        // private readonly redisService: RedisService,
        @Inject('REDIS_CLIENT') private readonly redis: Redis
    ) {}

    private getReactionSetKey(postId: number, reaction: string) {
        console.log(`post:${postId}:${reaction}`);
        return `post:${postId}:${reaction}`;
      }
    
      private getReactionCountKey(postId: number) {
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

        if (existingReaction) {
            // Update existing reaction
            existingReaction.type = createReactionDto.type;
            return this.reactionRepository.save(existingReaction);
        }

        // Create new reaction
        const newReaction = await this.reactionRepository.create({
            type: createReactionDto.type,
            user: { id: userId } as User,
            post
        });
        const reaction = await this.reactionRepository.save(newReaction);

        await this.redis.sadd(this.getReactionSetKey(createReactionDto.postId, createReactionDto.type), userId);

        return {
            msg: "success",
            data: reaction
        }
    }

    async findAll(): Promise<Reaction[]> {
        return this.reactionRepository.find({
            relations: ['user', 'post']
        });
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

    async update(id: number, updateReactionDto: UpdateReactionDto): Promise<Reaction> {
        const reaction = await this.findOne(id);
        Object.assign(reaction, updateReactionDto);
        return this.reactionRepository.save(reaction);
    }

    async remove(id: number): Promise<void> {
        const reaction = await this.findOne(id);
        await this.reactionRepository.remove(reaction);
    }

    async getPostReactions(postId: number): Promise<{ type: ReactionType; count: number }[]> {
        const reactions = await this.reactionRepository
            .createQueryBuilder('reaction')
            .select('reaction.type', 'type')
            .addSelect('COUNT(*)', 'count')
            .where('reaction.post.id = :postId', { postId })
            .groupBy('reaction.type')
            .getRawMany();

        return reactions;
    }
}
