import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendrequestService } from './friendrequest.service';
import { FriendrequestController } from './friendrequest.controller';
import { User } from '../user/entities/user.entity';
import { FriendRequest } from './entities/friendrequest.entity';
import { PagesModule } from '../pages/pages.module';
import { JwtModule } from '@nestjs/jwt';
import configuration from 'src/config/configuration';

@Module({
  imports: [
    TypeOrmModule.forFeature([FriendRequest, User]), 
    PagesModule,
    JwtModule.register({
                secret: configuration().jwt.secret,
                signOptions: { expiresIn: configuration().jwt.expires || '1h'},
            }),
  ],
  controllers: [FriendrequestController],
  providers: [FriendrequestService],
})
export class FriendrequestModule {}
