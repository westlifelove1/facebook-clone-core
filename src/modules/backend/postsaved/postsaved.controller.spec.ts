import { Test, TestingModule } from '@nestjs/testing';
import { PostSavedController } from './postsaved.controller';
import { PostSavedService } from './postsaved.service';

describe('PostSavedController', () => {
  let controller: PostSavedController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostSavedController],
      providers: [PostSavedService],
    }).compile();

    controller = module.get<PostSavedController>(PostSavedController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
