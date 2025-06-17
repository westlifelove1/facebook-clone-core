import { Controller, Get, Param, Delete, ParseIntPipe, Query, Request, UseGuards } from '@nestjs/common';
import { PhotoService } from './photo.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../../guards/auth/auth.guard';

@ApiTags('Backend / Photo')
@ApiBearerAuth('access_token')
@Controller('')
@UseGuards(AuthGuard)
export class PhotoController {
   constructor(private readonly photoService: PhotoService
   ){}

  @Get('user/:userId')
  findByUserId(
    @Param('userId', ParseIntPipe) userId: number,
    @Request() req,
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number
  ) {
    
    return this.photoService.findByUserId(+userId, page, limit);
  }

  @Get('post/:postId')
  findByPostId(@Param('postId', ParseIntPipe) postId: number) {
    return this.photoService.findByPostId(+postId);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.photoService.remove(+id);
  }
}
