import { ApiProperty } from '@nestjs/swagger';

export class ResponseUserDto {
    @ApiProperty({
        description: 'New registered user ID',
        example: 'new_user_id'
    })
    id: string;

    @ApiProperty({
        description: 'User email',
        example: 'newuser@example.com'
    })
    email: string;

    @ApiProperty({
        description: 'User fullnaeme',
        example: 'New User'
    })
    fullname: string;

      @ApiProperty({
        description: 'Display name',
        example: 'This is my display name'
    })
    displayname: string;

    @ApiProperty({
        description: 'phone',
        example: '0912345678'
    })
    phone: string;

    @ApiProperty({
        description: 'Createation date',
        example: '2024-03-21T10:00:00Z'
    })
    createdAt: string;
}
