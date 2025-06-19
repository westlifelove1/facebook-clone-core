import { IsNumber } from "class-validator";

export class CreatePostSavedDto {
    @IsNumber()
    postId: number;

    @IsNumber()
    userId: number;
}
