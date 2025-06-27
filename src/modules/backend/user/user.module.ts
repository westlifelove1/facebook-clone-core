import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/modules/backend/auth/auth.module';
import { FriendrequestModule } from '../friendrequest/friendrequest.module';
import { UserSearchService } from './user-search.service';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import configuration from 'src/config/configuration';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { rabbitMqConfig } from 'src/service/rabbitMQ/rabbitmq.config';

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        FriendrequestModule,
        forwardRef(() => AuthModule),
        ElasticsearchModule.register({
                    node: configuration().elasticsearch.node,
                }),
        ClientsModule.registerAsync([
            {
                name: 'SEARCH_SERVICE',
                inject: [ConfigService],
                useFactory: (configService: ConfigService) => rabbitMqConfig(configService),
            },
        ]),
    ],
    controllers: [UserController],
    providers: [UserService, UserSearchService],
    exports: [UserService],
})
export class UserModule { }
