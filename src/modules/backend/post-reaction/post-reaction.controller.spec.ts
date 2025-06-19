import { Test, TestingModule } from '@nestjs/testing';
import { PostReactionController } from './post-reaction.controller';
import { PostReactionService } from './post-reaction.service';

describe('PostReactionController', () => {
  let controller: PostReactionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostReactionController],
      providers: [PostReactionService],
    }).compile();

    controller = module.get<PostReactionController>(PostReactionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
