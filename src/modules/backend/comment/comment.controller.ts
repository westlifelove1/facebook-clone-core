import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query, BadRequestException } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { AuthGuard } from '../../../guards/auth/auth.guard';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
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
    @ApiOperation({ summary: 'Tạo bình luận mới' })
    @ApiBody({
        schema: {
            type: 'object',
            required: ['content'],
            properties: {
                content: {
                    type: 'string',
                    example: 'Bình luận',
                    description: 'Nội dung bình luận'
                },
                postId: {
                    type: 'number',
                    example: '1',
                    description: 'Post id'
                },
                parentCommentId: {
                    type: 'number',
                    example: '1',
                    description: 'Id của comment cha'
                }
            }
        }
    })
    @ApiResponse({
    status: 201,
    description: 'Tạo bình luận thành công',
    schema: {
        type: 'object',
        properties: {
            message: {
                type: 'string',
                example: 'Video created successfully'
            },
            result: {
                type: 'object',
                properties: {
                    id: { type: 'number', example: 1 },
                    title: { type: 'string', example: 'Video Title' },
                    description: { type: 'string', example: 'Video Description' },
                    image: { type: 'string', example: '/uploads/images/example.jpg' },
                    path: { type: 'string', example: '/uploads/videos/example.mp4' },
                    view: { type: 'number', example: 0 },
                    user_id: { type: 'number', example: 1 },
                    user_fullname: { type: 'string', example: 'John Doe' },
                    user_avatar: { type: 'string', example: '/uploads/avatars/example.jpg' },
                    tags: { type: 'array', example: ['tag1', 'tag2'] },
                    createdAt: { type: 'string', example: '2024-03-20T10:00:00Z' }
                }
            }
        }
    }
    })
    create(@Body() createCommentDto: CreateCommentDto, @Request() req) {
        const userId = Number(req.user?.sub);
        if (!userId || isNaN(userId)) {
            throw new BadRequestException('ID nguoi dung khong hop le');
        }
        return this.commentService.create(createCommentDto, userId);
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
        console.log(q);
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

    @Post('reindex')
    @ApiOperation({ summary: 'Reindex all comments in Elasticsearch' })
    async reindexComments() {
        return this.commentSearchService.reindexAllComments();
    }
}
