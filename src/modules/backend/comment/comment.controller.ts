import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { AuthGuard } from '../../../guards/auth/auth.guard';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CommentSearchService } from './comment-search.service';

@ApiTags('Backend / Comment')
@ApiBearerAuth('access_token')
@Controller('')
@UseGuards(AuthGuard)
export class CommentController {
    constructor(private readonly commentService: CommentService,
        private readonly commentSearchService: CommentSearchService,
    ) {}

    @Post()
    create(@Body() createCommentDto: CreateCommentDto, @Request() req) {
        return this.commentService.create(createCommentDto, req.user);
    }

    @Get()
    @ApiQuery({ name: 'q', required: false })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    findAll(
        @Query('q') q?: string,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.commentSearchService.searchComments(q, page, limit);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.commentService.findOne(+id);
    }

    @Get('post/:postId')
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    getPostComments(
        @Param('postId') postId: string,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.commentSearchService.searchCommentsByPost(+postId, page, limit);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateCommentDto: UpdateCommentDto) {
        return this.commentService.update(+id, updateCommentDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.commentService.remove(+id);
    }

    
    async searchComments(q?: string, page = 1, limit = 10) {
        return this.commentSearchService.searchComments(q, page, limit);
    }

    async searchCommentsByPost(postId: number, page = 1, limit = 10) {
        return this.commentSearchService.searchCommentsByPost(postId, page, limit);
    }
}
