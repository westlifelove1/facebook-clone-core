import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
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
    return this.postService.create(createPostDto, req.user);
  }

  @Get('news')
  newsFeed(
          @Request() req,
          @Query('q') q?: string,
          @Query('page') page?: number,
          @Query('limits') limit?: number
        ) {
    return this.postSearchService.searchPosts(req.user, q, page, limit);
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
