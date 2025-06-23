import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards, BadRequestException } from '@nestjs/common';
import { PostSavedService } from './postsaved.service';
import { CreatePostSavedDto } from './dto/create-postsaved.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../../guards/auth/auth.guard';

@ApiTags('Backend / PostSaved')
@ApiBearerAuth('access_token')
@Controller('')
@UseGuards(AuthGuard)
export class PostSavedController {
  constructor(private readonly postSavedService: PostSavedService) {}

  @Post()
  create(@Body() createPostSavedDto: CreatePostSavedDto) {
    return this.postSavedService.create(createPostSavedDto);
  }

  @Get()
  findAll(@Request() req) {
    const userId = Number(req.user?.sub);
    if (!userId || isNaN(userId)) {
        throw new BadRequestException('ID nguoi dung khong hop le');
    }
    return this.postSavedService.findAll(userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postSavedService.remove(+id);
  }
}
