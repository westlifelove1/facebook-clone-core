import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
    @ApiProperty({
        description: 'User Id',
        example: 'user_id'
    })
    id: string;

    @ApiProperty({
        description: 'Email',
        example: 'user@example.com'
    })
    email: string;

    @ApiProperty({
        description: 'User full name',
        example: 'User Name'
    })
    fullname: string;
}

export class AuthResponseDto {
    @ApiProperty({
        description: 'JWT access token',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    })
    accessToken: string;

    @ApiProperty({
        description: 'JWT refresh token ',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    })
    refreshToken: string;

    @ApiProperty({
        description: 'Access token expire time',
        example: 36000,
        type: Number
    })
    expiresIn: number;

    @ApiProperty({
        description: 'User information',
        type: UserResponseDto
    })
    user: UserResponseDto;
}

export class RegisterResponseDto {
    @ApiProperty({
        description: 'New registered user ID',
        example: 'new_user_id'
    })
    id: string;

    @ApiProperty({
        description: 'Email',
        example: 'newuser@example.com'
    })
    email: string;

    @ApiProperty({
        description: 'User full name',
        example: 'New User'
    })
    fullname: string;

    @ApiProperty({
        description: 'Create at',
        example: '2024-03-21T10:00:00Z'
    })
    createdAt: string;
}

export class RefreshTokenResponseDto {
    @ApiProperty({
        description: 'New JWT access token',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    })
    accessToken: string;

    @ApiProperty({
        description: 'New JWT refresh token',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    })
    refreshToken: string;

    @ApiProperty({
        description: 'Expire time of refresh token in milisecond',
        example: 36000,
        type: Number
    })
    expiresIn: number;
} 