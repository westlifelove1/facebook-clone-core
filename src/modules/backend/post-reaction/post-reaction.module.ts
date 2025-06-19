import { Module } from '@nestjs/common';
import { PostReactionService } from './post-reaction.service';
import { PostReaction } from './entities/post-reaction.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import configuration from 'src/config/configuration';

@Module({
  imports: [
    TypeOrmModule.forFeature([PostReaction]),
    JwtModule.register({
        secret: configuration().jwt.secret,
        signOptions: { expiresIn: configuration().jwt.expires || '1h'},
    }),
],
  providers: [PostReactionService],
})
export class PostReactionModule {}
