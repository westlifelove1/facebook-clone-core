import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { Comment } from './entities/comment.entity';
import { Post } from '../post/entities/post.entity';
import { CommentSearchService } from './comment-search.service';
import configuration from 'src/config/configuration';
import { ClientsModule } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { rabbitMqConfig } from 'src/service/rabbitMQ/rabbitmq.config';
import { CommentMicroservice } from './comment.microservice';
import { User } from '../user/entities/user.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Comment, Post, User]),
        JwtModule.register({
            secret: configuration().jwt.secret,
            signOptions: { expiresIn: configuration().jwt.expires || '1h'},
        }),
        ElasticsearchModule.register({
            node: configuration().elasticsearch.node,
        }),
        ClientsModule.registerAsync([
            {
                name: 'APP_SERVICE',
                inject: [ConfigService],
                useFactory: (configService: ConfigService) => rabbitMqConfig(configService),
            },
        ]),
    ],
    controllers: [CommentController, CommentMicroservice],
    providers: [CommentService, CommentSearchService],
    exports: [CommentService, CommentSearchService]
})
export class CommentModule {}
