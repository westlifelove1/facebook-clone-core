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
    const promises = Object.entries(reactions).map(async ([reaction, count]) => {
      const existReact = await this.postReactRepo.findOne({ where: { postId: postId, type: reaction } });
      if (existReact) {
        await this.postReactRepo.update(existReact.id, {
          type: reaction,
          count: parseInt(count, 10),
        });
      } else {
        const newReact = this.postReactRepo.create({
          postId,
          type: reaction,
          count: parseInt(count, 10),
        });
        await this.postReactRepo.save(newReact);
      }
    });
    await Promise.all(promises);
  }
}