import { Injectable } from '@nestjs/common';
import { CreatePostSavedDto } from './dto/create-post-saved.dto';
import { UpdatePostSavedDto } from './dto/update-post-saved.dto';

@Injectable()
export class PostSavedService {
  create(createPostSavedDto: CreatePostSavedDto) {
    return 'This action adds a new postSaved';
  }

  findAll() {
    return `This action returns all postSaved`;
  }

  findOne(id: number) {
    return `This action returns a #${id} postSaved`;
  }

  update(id: number, updatePostSavedDto: UpdatePostSavedDto) {
    return `This action updates a #${id} postSaved`;
  }

  remove(id: number) {
    return `This action removes a #${id} postSaved`;
  }
}
