import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/modules/backend/auth/auth.module';
import { FriendrequestModule } from '../friendrequest/friendrequest.module';


@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        FriendrequestModule,
        forwardRef(() => AuthModule),
    ],
    controllers: [UserController],
    providers: [UserService],
    exports: [UserService],
})
export class UserModule { }
