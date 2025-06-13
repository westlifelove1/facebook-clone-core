
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePostDto {
    @IsString()
    @IsNotEmpty()
    content: string;

    @IsNumber()
    isType: number; // 0: public, 1: friends, 2: only me

    mediaUrl: Record<string, any>;

    friends: Record<string, any>; // Optional field for friends

    @IsNumber()
    userId?: number;
}
