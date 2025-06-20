import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ReactionService } from './reaction.service';
import { ReactionRepository } from './reaction.repository';

@Injectable()
export class ReactionCronService {
  private readonly logger = new Logger(ReactionCronService.name);

  constructor(
    private readonly reactionService: ReactionService,
    private readonly reactionRepo: ReactionRepository,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async persistReactionsToDB() {
    const postIds = await this.reactionService.getAllPostIds();

    for (const postId of postIds) {
      const reactionMap = await this.reactionService.getReactions(postId);

      if (Object.keys(reactionMap).length === 0) continue;

      await this.reactionRepo.saveReactionCounts(postId, reactionMap);
      await this.reactionService.clearReactions(postId);
      
    }
  }
}
