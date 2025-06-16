import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreatePhotoDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()   
    url: string;

    @IsNumber()
    isType: number; // 0: image, 1: video

    @IsNumber()
    @IsNotEmpty()
    postId: number; // Foreign key to Post entity
} 
