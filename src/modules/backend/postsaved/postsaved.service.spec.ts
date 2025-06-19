import { Test, TestingModule } from '@nestjs/testing';
import { PostSavedService } from './postsaved.service';

describe('PostSavedService', () => {
  let service: PostSavedService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostSavedService],
    }).compile();

    service = module.get<PostSavedService>(PostSavedService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
