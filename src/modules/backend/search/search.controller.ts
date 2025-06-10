import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SearchService } from '../../../service/elasticsearch/search.service';
import { AuthGuard } from '../../../guards/auth/auth.guard';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('Backend / Search')
@Controller('')
@UseGuards(AuthGuard)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('users')
  @ApiOperation({ summary: 'Search users by keyword' })
  @ApiQuery({ name: 'query', required: true, description: 'Search keyword' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Results per page' })
  async searchUsers(
    @Query('query') query: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.searchService.searchUsers(query, page, limit);
  }

  @Get('posts')
  @ApiOperation({ summary: 'Search posts by keyword' })
  @ApiQuery({ name: 'query', required: true, description: 'Search keyword' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Results per page' })
  async searchPosts(
    @Query('query') query: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.searchService.searchPosts(query, page, limit);
  }
} 