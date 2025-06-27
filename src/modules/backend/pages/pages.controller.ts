import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, BadRequestException } from '@nestjs/common';
import { PagesService } from './pages.service';
import { CreatePageDto } from './dto/create-page.dto';
import { ApiTags,ApiBearerAuth,ApiOperation, ApiParam,ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '../../../guards/auth/auth.guard';
import { Page } from './entities/page.entity';

@ApiTags('Backend/Pages')
@ApiBearerAuth('access_token') 
@Controller('pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new page' })
  create(@Body() createPageDto: CreatePageDto) {
    return this.pagesService.create(createPageDto);
  }

  @UseGuards(AuthGuard)
  @Post(':id/like')
  @ApiOperation({ summary: 'Like a page' })
  @ApiParam({
    name: 'id',
    description: 'Page ID to be liked by logged-in user',
    example: 101,
  })
  likePage(@Param('id') id: number, @Req() req) {
    const userId = Number(req.user?.sub);
    if (!userId || isNaN(userId)) {
        throw new BadRequestException('Invalid user ID');
    }
    return this.pagesService.likePage(id, userId);
  }

  @Post(':id/unlike')
   @ApiOperation({ summary: 'Unlike a page' })
    @ApiParam({
    name: 'id',
    description: 'Page ID to be unliked by logged-in user',
    example: 101,
  })
  unlikePage(@Param('id') id: number, @Req() req) {
    const userId = Number(req.user?.sub);
    if (!userId || isNaN(userId)) {
        throw new BadRequestException('Invalid user ID');
    }
    return this.pagesService.unlikePage(id, userId);
  }

  @Get('liked')
  @ApiOperation({ summary: 'Return all liked pages of logged-in user' })
  getLikedPages(@Req() req) {
    const userId = Number(req.user?.sub);
    if (!userId || isNaN(userId)) {
        throw new BadRequestException('Invalid user ID');
    }
    return this.pagesService.getLikedPages(userId);
  }

  @Get('suggested')
  @ApiOperation({ summary: 'Return suggestion pages for logged-in user' })
  @ApiResponse({ status: 200, description: 'List of suggested pages', type: [Page] })
  getSuggestedPages(@Req() req) {
    const userId = Number(req.user?.sub);
    if (!userId || isNaN(userId)) {
        throw new BadRequestException('Invalid user ID');
    }
    return this.pagesService.getSuggestedPages(userId);
  }
}
