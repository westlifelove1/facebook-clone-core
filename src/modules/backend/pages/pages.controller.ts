import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, BadRequestException } from '@nestjs/common';
import { PagesService } from './pages.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../../guards/auth/auth.guard';

@ApiTags('Backend/Pages')
@Controller('pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Post()
  create(@Body() createPageDto: CreatePageDto) {
    return this.pagesService.create(createPageDto);
  }

  @UseGuards(AuthGuard)
  @Post(':id/like')
  likePage(@Param('id') id: number, @Req() req) {
    const userId = Number(req.user?.sub);
    if (!userId || isNaN(userId)) {
        throw new BadRequestException('ID nguoi dung khong hop le');
    }
    return this.pagesService.likePage(id, userId);
  }

  @Post(':id/unlike')
  unlikePage(@Param('id') id: number, @Req() req) {
    const userId = Number(req.user?.sub);
    if (!userId || isNaN(userId)) {
        throw new BadRequestException('ID nguoi dung khong hop le');
    }
    return this.pagesService.unlikePage(id, userId);
  }

  @Get('liked')
  getLikedPages(@Req() req) {
    const userId = Number(req.user?.sub);
    if (!userId || isNaN(userId)) {
        throw new BadRequestException('ID nguoi dung khong hop le');
    }
    return this.pagesService.getLikedPages(userId);
  }

  @Get('suggested')
  getSuggestedPages(@Req() req) {
    const userId = Number(req.user?.sub);
    if (!userId || isNaN(userId)) {
        throw new BadRequestException('ID nguoi dung khong hop le');
    }
    return this.pagesService.getSuggestedPages(userId);
  }
}
