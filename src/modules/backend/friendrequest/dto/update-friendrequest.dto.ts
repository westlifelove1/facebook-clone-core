import { PartialType } from '@nestjs/mapped-types';
import { CreateFriendrequestDto } from './create-friendrequest.dto';

export class UpdateFriendrequestDto extends PartialType(CreateFriendrequestDto) {}
