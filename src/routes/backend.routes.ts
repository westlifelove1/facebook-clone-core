import { Routes } from '@nestjs/core';
import { AuthModule } from 'src/modules/backend/auth/auth.module';
import { UserModule } from 'src/modules/backend/user/user.module';
import { SettingModule } from 'src/modules/backend/setting/setting.module';
import { TokenModule } from 'src/modules/backend/token/token.module';
import { CommonModule } from 'src/modules/backend/common/common.module';
import { ReactionModule } from 'src/modules/backend/reaction/reaction.module';
import { CommentModule } from 'src/modules/backend/comment/comment.module';
import { PostModule } from 'src/modules/backend/post/post.module';
import { FriendrequestModule } from  'src/modules/backend/friendrequest/friendrequest.module';
import { PhotoModule } from 'src/modules/backend/photo/photo.module';

export const backendRoutes: Routes = [
    { path: 'backend/user', module: UserModule },
    { path: 'backend/auth', module: AuthModule },
    { path: 'backend/setting', module: SettingModule },
    { path: 'backend/token', module: TokenModule },
    { path: 'backend/common', module: CommonModule },
    { path: 'backend/reaction', module: ReactionModule },
    { path: 'backend/comment', module: CommentModule },
    { path: 'backend/post', module: PostModule },
    { path: 'backend/friendrequest', module: FriendrequestModule },
    { path: 'backend/photo', module: PhotoModule },
];

export const backendModules = [
    AuthModule,
    UserModule,
    CommonModule,
    TokenModule,
    SettingModule,
    ReactionModule,
    CommentModule,
    PostModule,
    FriendrequestModule,
    PhotoModule,
];