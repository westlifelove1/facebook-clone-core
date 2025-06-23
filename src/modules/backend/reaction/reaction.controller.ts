import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { ReactionService } from './reaction.service';
import { CreateReactionDto } from './dto/create-reaction.dto';
import { UpdateReactionDto } from './dto/update-reaction.dto';
import { AuthGuard } from '../../../guards/auth/auth.guard';
import { ReactionType } from 'src/enums/reaction-type.enum';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Backend / Reaction')
@ApiBearerAuth('access_token') 
@Controller()
@UseGuards(AuthGuard)
export class ReactionController {
  constructor(private readonly reactionService: ReactionService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo reaction mới' })
  @ApiBody({
      schema: {
          type: 'object',
          required: ['title'],
          properties: {
              title: {
                  type: 'string',
                  example: 'Video Title',
                  description: 'Tiêu đề video'
              },
              description: {
                  type: 'string',
                  example: 'Video Description',
                  description: 'Mô tả video'
              },
              image: {
                  type: 'string',
                  example: '/uploads/images/example.jpg',
                  description: 'Đường dẫn ảnh thumbnail'
              },
              path: {
                  type: 'string',
                  example: '/uploads/videos/example.mp4',
                  description: 'Đường dẫn file video'
              },
              isActive: {
                  type: 'boolean',
                  example: true,
                  description: 'Trạng thái video (true: hiển thị, false: ẩn)'
              },
              tags: {
                  type: 'array',
                  example: ['tag1', 'tag2'],
                  description: 'Tags của video'
              }
          }
      }
    })
    @ApiResponse({
      status: 201,
      description: 'Tạo video thành công',
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
  create(@Body() createReactionDto: CreateReactionDto, @Request() req) {
    const userId = Number(req.user?.sub);
        if (!userId || isNaN(userId)) {
          throw new BadRequestException('ID nguoi dung khong hop le');
        }
    return this.reactionService.create(createReactionDto, userId);
  }

  @Get()
  findAll() {
    return this.reactionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reactionService.getReactions(id);
  }

  @Get('post/:postId')
  getPostReactions(@Param('postId') postId: string) {
    return this.reactionService.getPostReactions(+postId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReactionDto: UpdateReactionDto) {
    return this.reactionService.update(+id, updateReactionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reactionService.remove(+id);
  }
}
