import { PartialType } from '@nestjs/mapped-types';
import { CreatePostSavedDto } from './create-post-saved.dto';

export class UpdatePostSavedDto extends PartialType(CreatePostSavedDto) {}
