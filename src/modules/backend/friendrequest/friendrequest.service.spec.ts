import { Test, TestingModule } from '@nestjs/testing';
import { FriendrequestService } from './friendrequest.service';

describe('FriendrequestService', () => {
  let service: FriendrequestService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FriendrequestService],
    }).compile();

    service = module.get<FriendrequestService>(FriendrequestService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
