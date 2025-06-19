import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PostSavedService } from './post-saved.service';
import { CreatePostSavedDto } from './dto/create-post-saved.dto';
import { UpdatePostSavedDto } from './dto/update-post-saved.dto';

@Controller('post-saved')
export class PostSavedController {
  constructor(private readonly postSavedService: PostSavedService) {}

  @Post()
  create(@Body() createPostSavedDto: CreatePostSavedDto) {
    return this.postSavedService.create(createPostSavedDto);
  }

  @Get()
  findAll() {
    return this.postSavedService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postSavedService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePostSavedDto: UpdatePostSavedDto) {
    return this.postSavedService.update(+id, updatePostSavedDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postSavedService.remove(+id);
  }
}
