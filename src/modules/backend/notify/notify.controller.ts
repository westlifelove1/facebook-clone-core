import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query, BadRequestException } from '@nestjs/common';
import { NotifyService } from './notify.service';
import { CreateNotifyDto } from './dto/create-notify.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../../guards/auth/auth.guard';
import { NotifySearchService } from './notify-search.service';

@ApiTags('Backend / Notify')
@ApiBearerAuth('access_token')
@Controller('')
@UseGuards(AuthGuard)
export class NotifyController {
  constructor(private readonly notifyService: NotifyService,
               private readonly notifySearchService: NotifySearchService, 
  ) {}

  @Post()
  create(@Body() createNotifyDto: CreateNotifyDto, @Request() req) {
      const userId = Number(req.user?.sub);
      if (!userId || isNaN(userId)) {
          throw new BadRequestException('ID nguoi dung khong hop le');
      }
      createNotifyDto.userId = userId;
      console.log('createNotifyDto', createNotifyDto);

    return this.notifyService.create(createNotifyDto);
  }

  @Get('news')
  newsFeed(
          @Request() req,
          @Query('q') q?: string,
          @Query('page') page?: number,
          @Query('limit') limit?: number
        ) {
        const userId = Number(req.user?.sub);
        if (!userId || isNaN(userId)) {
            throw new BadRequestException('ID nguoi dung khong hop le');
        }
    return this.notifySearchService.searchNotify(userId, q, page, limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.notifyService.findOne(+id);
  }



  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notifyService.remove(+id);
  }
}
