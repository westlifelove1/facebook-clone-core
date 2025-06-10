import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from '../../../service/elasticsearch/search.service';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import configuration from 'src/config/configuration';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { rabbitMqConfig } from 'src/service/rabbitMQ/rabbitmq.config';

@Module({
  imports: [
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
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {} 