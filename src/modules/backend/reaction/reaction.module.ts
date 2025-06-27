import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ReactionService } from './reaction.service';
import { ReactionController } from './reaction.controller';
import { Reaction } from './entities/reaction.entity';
import { Post } from '../post/entities/post.entity';
import configuration from 'src/config/configuration';
import { RedisModule } from 'src/service/redis/redis.module';
import { Notify } from '../notify/entities/notify.entity';
import { ClientsModule } from '@nestjs/microservices';
import { rabbitMqConfig } from 'src/service/rabbitMQ/rabbitmq.config';
import { ConfigService } from '@nestjs/config';
import { User } from '../user/entities/user.entity';
import { PostReaction } from '../entities/post-reaction.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Reaction, Post, User, Notify, PostReaction]),
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
        RedisModule,
    ],
    controllers: [ReactionController],
    providers: [ReactionService],
    exports: [ReactionService]
})
export class ReactionModule {}
