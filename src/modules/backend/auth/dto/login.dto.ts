import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
    @ApiProperty({
        description: 'Email',
        example: 'testmail@gmail.com',
    })
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'Password',
        example: 'password',
    })
    @IsNotEmpty()
    @IsString()
    password: string;
}
