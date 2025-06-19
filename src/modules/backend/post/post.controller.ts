import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query, BadRequestException } from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../../guards/auth/auth.guard';
import { PostSearchService } from './post-search.service';

@ApiTags('Backend / Post')
@ApiBearerAuth('access_token')
@Controller('')
@UseGuards(AuthGuard)
export class PostController {
  constructor(private readonly postService: PostService,
               private readonly postSearchService: PostSearchService, 
  ) {}

  @Post()
  create(@Body() createPostDto: CreatePostDto, @Request() req) {
      const userId = Number(req.user?.sub);
      if (!userId || isNaN(userId)) {
          throw new BadRequestException('ID nguoi dung khong hop le');
      }
    return this.postService.create(createPostDto, userId);
  }

  @Get('news')
  newsFeed(
          @Request() req,
          @Query('q') q?: string,
          @Query('user_id') user_id?: number,
          @Query('page') page?: number,
          @Query('limit') limit?: number
        ) {
          let userId: number;
          if (typeof user_id !== 'undefined' && user_id < 0) {
            userId = Number(user_id);
          } else {
            userId = Number(req.user?.sub);
            if (!userId || isNaN(userId)) {
                throw new BadRequestException('ID nguoi dung khong hop le');
            }
          }
       
    return this.postSearchService.searchPosts(userId, q, page, limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postService.update(+id, updatePostDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postService.remove(+id);
  }
}
