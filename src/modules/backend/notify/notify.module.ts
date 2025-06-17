import { Module } from '@nestjs/common';
import { NotifyService } from './notify.service';
import { NotifyController } from './notify.controller';
import { Notify } from '../notify/entities/notify.entity';

import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { ClientsModule } from '@nestjs/microservices';
import configuration from 'src/config/configuration';
import { ConfigService } from '@nestjs/config';
import { rabbitMqConfig } from 'src/service/rabbitMQ/rabbitmq.config';
import { User } from '../user/entities/user.entity';
import { NotifyMicroservice } from './notify.microservice';
import { NotifySearchService } from './notify-search.service';
import { Post } from '../post/entities/post.entity';

@Module({
 imports: [
         TypeOrmModule.forFeature([Post, User, Notify]),
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
  controllers: [NotifyController, NotifyMicroservice],
  providers: [NotifyService, NotifySearchService],
  exports: [NotifyService, NotifySearchService]
})
export class NotifyModule {}
