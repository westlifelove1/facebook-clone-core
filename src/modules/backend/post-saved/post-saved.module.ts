import { Module } from '@nestjs/common';
import { PostSavedService } from './post-saved.service';
import { PostSavedController } from './post-saved.controller';

@Module({
  controllers: [PostSavedController],
  providers: [PostSavedService],
})
export class PostSavedModule {}
