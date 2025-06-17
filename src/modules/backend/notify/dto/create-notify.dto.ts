
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Column } from 'typeorm';

export class CreateNotifyDto {
    @IsString()
    @IsNotEmpty()
    content: string;

    @Column()
    PostId: number;

    @Column()
    userId: number;

}
