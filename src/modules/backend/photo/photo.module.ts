import { Module, Post } from '@nestjs/common';
import { PhotoService } from './photo.service';
import { PhotoController } from './photo.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Photo } from './entities/photo.entity';
import { JwtModule } from '@nestjs/jwt';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { ClientsModule } from '@nestjs/microservices';
import configuration from 'src/config/configuration';
import { ConfigService } from '@nestjs/config';
import { rabbitMqConfig } from 'src/service/rabbitMQ/rabbitmq.config';

@Module({
  imports: [
        TypeOrmModule.forFeature([Photo, Post]),
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
  controllers: [PhotoController],
  providers: [PhotoService],
})
export class PhotoModule {}
