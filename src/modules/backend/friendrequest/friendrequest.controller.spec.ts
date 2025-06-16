import { Test, TestingModule } from '@nestjs/testing';
import { FriendrequestController } from './friendrequest.controller';
import { FriendrequestService } from './friendrequest.service';

describe('FriendrequestController', () => {
  let controller: FriendrequestController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FriendrequestController],
      providers: [FriendrequestService],
    }).compile();

    controller = module.get<FriendrequestController>(FriendrequestController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
