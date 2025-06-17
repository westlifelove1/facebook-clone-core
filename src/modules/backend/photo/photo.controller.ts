import { Controller, Get, Param, Delete, ParseIntPipe, Query, Request, UseGuards, BadRequestException } from '@nestjs/common';
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

  @Get('user')
  findByUserId(
    @Request() req,
    @Query('user_id') user_id: string,
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number
  ) {
    let userId = parseInt(user_id);
    if (isNaN(userId) || userId <= 0) {
      userId = Number(req.user?.sub);
      if (!userId || isNaN(userId)) {
          throw new BadRequestException('ID nguoi dung khong hop le');
      }
    }
    console.log('userId', userId, 'page', page, 'limit', limit);
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
