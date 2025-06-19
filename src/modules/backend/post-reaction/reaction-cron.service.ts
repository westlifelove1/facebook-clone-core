import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PostReactionService } from './post-reaction.service';

@Injectable()
export class ReactionCronService {
  private readonly logger = new Logger(ReactionCronService.name);

  constructor(
    private readonly postReactionService: PostReactionService,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async persistReactions() {
    const postIds = await this.postReactionService.getAllPostIds();

    for (const postId of postIds) {
      const reactions = await this.postReactionService.getReactions(postId);

      await this.postReactionService.saveReactionCounts(postId, reactions);
      await this.postReactionService.clearReactions(postId);

      this.logger.log(`Saved reactions for post ${postId}`);
    }
  }
}