import { Inject, Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { InjectRepository } from '@nestjs/typeorm';
import { PostReaction } from './entities/post-reaction.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PostReactionService {
  constructor(
    @InjectRepository(PostReaction)
    private postReactRepo: Repository<PostReaction>,
    @Inject('REDIS_CLIENT') private readonly redis: Redis
) {}

  private getReactionHashKey(postId: string): string {
    return `post:${postId}:reactions`;
  }

  async react(postId: string, userId: string, reaction: string) {
    const key = this.getReactionHashKey(postId);
    await this.redis.hincrby(key, reaction, 1);
    // Optional: track user reactions if needed for undo, etc.
  }

  async getReactions(postId: string): Promise<Record<string, string>> {
    const key = this.getReactionHashKey(postId);
    return await this.redis.hgetall(key);
  }

  async getAllPostIds(): Promise<string[]> {
    const keys = await this.redis.keys('post:*:reactions');
    return keys.map(k => k.split(':')[1]); // Extract postId
  }

  async clearReactions(postId: string) {
    const key = this.getReactionHashKey(postId);
    await this.redis.del(key);
  }

  async saveReactionCounts(postId: string, reactions: Record<string, string>) {
    const updates = Object.entries(reactions).map(([type, count]) => {
      return this.postReactRepo.create({
        postId,
        type,
        count: parseInt(count),
      });
    });

    await this.postReactRepo.save(updates);
  }
}
