import { Module } from '@nestjs/common';
import { PagesService } from './pages.service';
import { PagesController } from './pages.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Page } from  './entities/page.entity';
import { User } from '../user/entities/user.entity';
import { AuthModule } from '../auth/auth.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([Page, User]), 
    AuthModule,
  ],
  controllers: [PagesController],
  providers: [PagesService],
})
export class PagesModule {}
