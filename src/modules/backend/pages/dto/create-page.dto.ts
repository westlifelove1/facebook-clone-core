import { IsNotEmpty,  IsOptional, IsUrl} from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class CreatePageDto {
   @ApiProperty({
    description: 'Name of the page',
    example: 'fake facebook page',
  })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'The URL of the page picture',
    example: 'https://example.com/images/page-avatar.png',
  })
  @IsUrl()
  @IsOptional()
  pagepicture?: string;

  @ApiProperty({
    description: 'Page description',
    example: 'This is a sample page description.',
  })
  @IsOptional()
  description?: string;
}
