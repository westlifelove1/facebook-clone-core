import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { PhotoService } from './photo.service';
import { CreatePhotoDto } from './dto/create-photo.dto';
import { UpdatePhotoDto } from './dto/update-photo.dto';

@Controller('photo')
export class PhotoController {
  constructor(private readonly photoService: PhotoService) {}

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.photoService.findOne(+id);
  }

  @Get('/post/:postId')
  findByPostId(@Param('postId', ParseIntPipe) postId: number) {
    return this.photoService.findByPostId(+postId);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.photoService.remove(+id);
  }
}
