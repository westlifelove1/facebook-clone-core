import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { ReactionType } from 'src/enums/reaction-type.enum';


export class CreateReactionDto {
    @IsEnum(ReactionType)
    @IsNotEmpty()
    type: ReactionType;

    @IsNumber()
    @IsNotEmpty()
    postId: number;
}
