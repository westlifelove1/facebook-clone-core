import { Module } from '@nestjs/common';
import { PostSavedService } from './postsaved.service';
import { PostSavedController } from './postsaved.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { PostSaved } from './entities/postsaved.entity';
import { Post } from '../post/entities/post.entity';
import { User } from '../user/entities/user.entity';
import configuration from 'src/config/configuration';
import { rabbitMqConfig } from 'src/service/rabbitMQ/rabbitmq.config';
import { NotifyService } from '../notify/notify.service';
import { Notify } from '../notify/entities/notify.entity';

@Module({
  imports: [
            TypeOrmModule.forFeature([Post, User, PostSaved, Notify]),
            JwtModule.register({
                secret: configuration().jwt.secret,
                signOptions: { expiresIn: configuration().jwt.expires || '1h'},
            }),
           
            ClientsModule.registerAsync([
                {
                    name: 'APP_SERVICE',
                    inject: [ConfigService],
                    useFactory: (configService: ConfigService) => rabbitMqConfig(configService),
                },
            ]),
    
  ],
  controllers: [PostSavedController],
  providers: [PostSavedService, NotifyService],
  exports: [PostSavedService, NotifyService]
})
export class PostSavedModule {}
