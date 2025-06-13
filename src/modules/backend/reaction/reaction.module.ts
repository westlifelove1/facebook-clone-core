import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ReactionService } from './reaction.service';
import { ReactionController } from './reaction.controller';
import { Reaction } from './entities/reaction.entity';
import { Post } from '../post/entities/post.entity';
import configuration from 'src/config/configuration';
import { RedisModule } from 'src/service/redis/redis.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Reaction, Post]),
        JwtModule.register({
            secret: configuration().jwt.secret,
            signOptions: { expiresIn: configuration().jwt.expires || '1h'},
        }),
        RedisModule,
    ],
    controllers: [ReactionController],
    providers: [ReactionService],
    exports: [ReactionService]
})
export class ReactionModule {}
