import { ApiProperty } from '@nestjs/swagger';

export class ResponseUserDto {
    @ApiProperty({
        description: 'ID của người dùng mới đăng ký',
        example: 'new_user_id'
    })
    id: string;

    @ApiProperty({
        description: 'Email của người dùng',
        example: 'newuser@example.com'
    })
    email: string;

    @ApiProperty({
        description: 'Tên của người dùng',
        example: 'New User'
    })
    fullname: string;

    @ApiProperty({
        description: 'Điện thoại người dùng',
        example: '0912345678'
    })
    phone: string;

    @ApiProperty({
        description: 'Thời gian tạo tài khoản',
        example: '2024-03-21T10:00:00Z'
    })
    createdAt: string;
}
