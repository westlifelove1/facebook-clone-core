import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query, BadRequestException } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { AuthGuard } from '../../../guards/auth/auth.guard';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
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
            required: ['content', 'postId'],
            properties: {
                content: {
                    type: 'string',
                    example: 'Bình luận',
                    description: 'Nội dung bình luận'
                },
                postId: {
                    type: 'number',
                    example: '1',
                    description: 'ID của post'
                },
                parentCommentId: {
                    type: 'number',
                    example: 'null',
                    description: 'Id của comment cha'
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

    // @Get()
    // @ApiQuery({ name: 'q', required: false })
    // @ApiQuery({ name: 'page', required: false, type: Number })
    // @ApiQuery({ name: 'limit', required: false, type: Number })
    // findAll(
    //     @Query('q') q?: string,
    //     @Query('page') page?: number,
    //     @Query('limit') limit?: number,
    // ) {
    //     return this.commentSearchService.searchComments(q, page, limit);
    // }

    // @Get(':id')
    // findOne(@Param('id') id: string) {
    //     return this.commentService.findOne(+id);
    // }

    @Get('post/:postId')
    @ApiOperation({ summary: 'Lấy tất cả bình luận của 1 post' })
    @ApiParam({ name: 'postId', required: true, type: String })
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
    @ApiOperation({ summary: 'Chỉnh sửa bình luận' })
    @ApiBody({
        schema: {
            type: 'object',
            required: ['id'],
            properties: {
                id: {
                    type: 'number',
                    example: '1',
                    description: 'ID của bình luận'
                }
            }
        }
    })
    update(@Param('id') id: string, @Body() updateCommentDto: UpdateCommentDto) {
        return this.commentService.update(+id, updateCommentDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Xóa bình luận' })
    @ApiBody({
        schema: {
            type: 'object',
            required: ['id'],
            properties: {
                id: {
                    type: 'number',
                    example: '1',
                    description: 'ID của bình luận'
                }
            }
        }
    })
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
