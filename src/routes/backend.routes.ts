import { Routes } from '@nestjs/core';
import { AuthModule } from 'src/modules/backend/auth/auth.module';
import { UserModule } from 'src/modules/backend/user/user.module';
import { SettingModule } from 'src/modules/backend/setting/setting.module';
import { TokenModule } from 'src/modules/backend/token/token.module';
import { CommonModule } from 'src/modules/backend/common/common.module';
import { PermissionModule } from 'src/modules/backend/permission/permission.module';
import { GroupPermissionModule } from 'src/modules/backend/group-permission/group-permission.module';
import { ReactionModule } from 'src/modules/backend/reaction/reaction.module';
import { CommentModule } from 'src/modules/backend/comment/comment.module';
import { SearchModule } from 'src/modules/backend/search/search.module';

export const backendRoutes: Routes = [
    { path: 'backend/user', module: UserModule },
    { path: 'backend/auth', module: AuthModule },
    { path: 'backend/setting', module: SettingModule },
    { path: 'backend/token', module: TokenModule },
    { path: 'backend/common', module: CommonModule },
    { path: 'backend/permission', module: PermissionModule },
    { path: 'backend/group-permission', module: GroupPermissionModule },
    { path: 'backend/reaction', module: ReactionModule },
    { path: 'backend/comment', module: CommentModule },
    { path: 'backend/search', module: SearchModule },
];

export const backendModules = [
    AuthModule,
    UserModule,
    PermissionModule,
    GroupPermissionModule,
    CommonModule,
    TokenModule,
    SettingModule,
    ReactionModule,
    CommentModule,
    SearchModule,
];