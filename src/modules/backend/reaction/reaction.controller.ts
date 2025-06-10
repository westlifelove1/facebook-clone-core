import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ReactionService } from './reaction.service';
import { CreateReactionDto } from './dto/create-reaction.dto';
import { UpdateReactionDto } from './dto/update-reaction.dto';
import { AuthGuard } from '../../../guards/auth/auth.guard';
import { ReactionType } from 'src/enums/reaction-type.enum';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Backend / Reaction')
@ApiBearerAuth('access_token') 
@Controller()
@UseGuards(AuthGuard)
export class ReactionController {
  constructor(private readonly reactionService: ReactionService) {}

  @Post()
  create(@Body() createReactionDto: CreateReactionDto, @Request() req) {
    return this.reactionService.create(createReactionDto, req.user);
  }

  @Get()
  findAll() {
    return this.reactionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reactionService.findOne(+id);
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
