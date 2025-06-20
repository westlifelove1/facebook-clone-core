import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostReaction } from '../entities/post-reaction.entity';

@Injectable()
export class ReactionRepository {
  constructor(
    @InjectRepository(PostReaction)
    private readonly postReactRepo: Repository<PostReaction>,
  ) {}

  async saveReactionCounts(postId: string, reactions: Record<string, string>) {
    const entities = Object.entries(reactions).map(([reaction, count]) =>
      this.postReactRepo.create({
        postId,
        type: reaction,
        count: parseInt(count, 10),
      }),
    );

    await this.postReactRepo.save(entities);
  }
}