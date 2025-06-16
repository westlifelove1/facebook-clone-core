import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { Post } from '../post/entities/post.entity';

import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { ClientsModule } from '@nestjs/microservices';
import configuration from 'src/config/configuration';
import { ConfigService } from '@nestjs/config';
import { rabbitMqConfig } from 'src/service/rabbitMQ/rabbitmq.config';
import { PostMicroservice } from './post.microservice';
import { PostSearchService } from './post-search.service';
import { User } from '../user/entities/user.entity';
import { Photo } from '../photo/entities/photo.entity';
@Module({
  imports: [
        TypeOrmModule.forFeature([Post, User, Photo]),
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
  controllers: [PostController,PostMicroservice],
  providers: [PostService, PostSearchService],
  exports: [PostService, PostSearchService]
})
export class PostModule {}
