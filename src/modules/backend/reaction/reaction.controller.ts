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
  @ApiOperation({ summary: 'Tạo reaction mới/update reaction' })
  @ApiBody({
    schema: {
        type: 'object',
        required: ['type', 'postId'],
        properties: {
            type: {
                type: 'string',
                example: 'like',
                description: 'reaction cần tạo'
            },
            postId: {
                type: 'number',
                example: '1',
                description: 'ID của post'
            }
        }
    }
  })
  async create(@Body() createReactionDto: CreateReactionDto, @Request() req) {
    const userId = Number(req.user?.sub);
    if (!userId || isNaN(userId)) {
      throw new BadRequestException('ID nguoi dung khong hop le');
    }
    return await this.reactionService.create(createReactionDto, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'tổng hợp reactions của 1 post' })
  @ApiBody({
    schema: {
        type: 'object',
        required: ['id'],
        properties: {
              id: {
                type: 'number',
                example: '1',
                description: 'ID của post'
            }
        }
    }
  })
  getReactions(@Param('id') id: string) {
    return this.reactionService.getReactions(id);
  }

  // @Get('post/:postId')
  // getPostReactions(@Param('postId') postId: string) {
  //   return this.reactionService.getPostReactions(+postId);
  // }

  @Get('post/:postId/users')
  @ApiOperation({ summary: 'tổng hợp user react của 1 post' })
  @ApiBody({
    schema: {
        type: 'object',
        required: ['postId'],
        properties: {
            postId: {
                type: 'number',
                example: '1',
                description: 'ID của post'
            }
        }
    }
  })
  async getUsersReactedToPost(@Param('postId') postId: string) {
    return this.reactionService.getUsersReactedToPost(+postId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'xóa reaction' })
  @ApiBody({
    schema: {
        type: 'object',
        required: ['id'],
        properties: {
              id: {
                type: 'number',
                example: '1',
                description: 'ID của reaction'
            }
        }
    }
  })
  remove(@Param('id') id: string) {
    return this.reactionService.remove(+id);
  }
}
