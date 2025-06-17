import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendrequestService } from './friendrequest.service';
import { FriendrequestController } from './friendrequest.controller';
import { User } from '../user/entities/user.entity';
import { FriendRequest } from './entities/friendrequest.entity';
import { PagesModule } from '../pages/pages.module';

@Module({
  imports: [TypeOrmModule.forFeature([FriendRequest, User]), PagesModule],
  controllers: [FriendrequestController],
  providers: [FriendrequestService],
})
export class FriendrequestModule {}
