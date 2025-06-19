import { PartialType } from '@nestjs/mapped-types';
import { CreatePostSavedDto } from './create-postsaved.dto';

export class UpdatePostSavedDto extends PartialType(CreatePostSavedDto) {}
