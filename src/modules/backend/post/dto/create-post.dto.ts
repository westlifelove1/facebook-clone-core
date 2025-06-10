
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePostDto {
    @IsString()
    @IsNotEmpty()
    content: string;

    mediaUrl: JSON;

    @IsNumber()
    authorId?: number;
}
