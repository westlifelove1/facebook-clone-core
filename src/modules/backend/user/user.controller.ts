import { Controller, Get, Post, Body, Param, Query, Put, Request, Req } from '@nestjs/common';
import { ApiTags, ApiQuery, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { ResponseUserDto } from './dto/response-user.dto';
import { Public }  from 'src/decorators/public.decorator'; 


@ApiTags('Backend / User')
@Controller()
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Public()
    @Post('register')
    @ApiOperation({ summary: 'Tạo tài khoản mới' })
    @ApiBody({
        type: CreateUserDto,
        description: 'Thông tin đăng ký',
        examples: {
            example1: {
                value: {
                    email: 'testemail@gmail.com',
                    password: '123456',
                    fullname: 'Testing Name',
                    phone: '0123456789',
                    profilepic: 'https://example.com/avatar.jpg',
                    coverpic: 'https://example.com/cover.jpg',
                    bio: 'This is my  bio',
                    birthplace: 'HCM, Vietnam',
                    workingPlace: 'HCM, Vietnam',
                }
            }
        }
    })
    @ApiResponse({
        status: 201,
        description: 'Đăng ký thành công',
        type: ResponseUserDto
    })
    async register(@Body() createuserDto: CreateUserDto, @Req() req: Request) {
        return this.userService.register(createuserDto, req);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Cập nhật thông tin user' })
    @ApiBearerAuth('access_token') 
    @ApiParam({ 
        name: 'id', 
        type: 'number', 
        description: 'ID của user cần cập nhật',
        example: 1
    })
    @ApiBody({
        type: UpdateUserDto,
        description: 'Thông tin cần cập nhật cho user. Email không được phép thay đổi.',
        examples: {
            example1: {
                value: {
                    fullname: 'My fullname',
                    phone: '0123456789',
                    profilepic: 'https://example.com/avatar.jpg',
                    coverpic: 'https://example.com/cover.jpg',
                    bio: 'This is my new bio',
                    birthplace: 'HCM, Vietnam',
                    workingPlace: 'HCM, Vietnam',
                    isActive: true,
                }
            }
        }
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Cập nhật user thành công',
        schema: {
            example: {
                id: 1,
                fullname: 'Nguyen Van A',
                phone: '0123456789',
                avatar: 'https://example.com/avatar.jpg',
                email: 'user@example.com',
                status: 'active',
                createdAt: '2024-03-20T10:00:00Z',
                updatedAt: '2024-03-20T10:00:00Z'
            }
        }
    })
    @ApiResponse({ status: 404, description: 'User not found' })
    update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto): Promise<User> {
        return this.userService.update(id, updateUserDto);
    }

    @Get(':id')
    @ApiBearerAuth('access_token') 
    @ApiOperation({ summary: 'Lấy thông tin user theo ID' })
    @ApiParam({ 
        name: 'id', 
        type: 'number', 
        description: 'ID của user cần lấy thông tin',
        example: 1
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Thông tin user',
        schema: {
            example: {
                id: 1,
                fullname: 'Nguyen Van A',
                phone: '0123456789',
                profilepic: 'https://example.com/avatar.jpg',
                coverpic: 'https://example.com/cover.jpg',
                bio: 'This is my bio',
                birthplace: 'HCM, Vietnam',
                workingPlace: 'HCM, Vietnam',
                email: 'user@example.com',
                status: 'active',
                createdAt: '2024-03-20T10:00:00Z',
                updatedAt: '2024-03-20T10:00:00Z'
            }
        }
    })
    @ApiResponse({ status: 404, description: 'User not found' })
    findOne(@Param('id') id: number): Promise<User> {
        return this.userService.findOne(id);
    }

    @Get()
    @ApiBearerAuth('access_token') 
    @ApiOperation({ summary: 'Tìm kiếm user' })
    @ApiResponse({ 
        status: 200, 
        description: 'Danh sách user',
        schema: {
            example: {
                items: [
                    {
                       id: 1,
                        fullname: 'Nguyen Van A',
                        phone: '0123456789',
                        profilepic: 'https://example.com/avatar.jpg',
                        coverpic: 'https://example.com/cover.jpg',
                        bio: 'This is my bio',
                        birthplace: 'HCM, Vietnam',
                        workingPlace: 'HCM, Vietnam',
                        email: 'user@example.com',
                        status: 'active',
                        createdAt: '2024-03-20T10:00:00Z',
                        updatedAt: '2024-03-20T10:00:00Z'
                    }
                ],
                meta: {
                    total: 1,
                    page: 1,
                    limit: 10,
                    totalPages: 1
                }
            }
        }
    })
    @ApiQuery({ 
        name: 'q', 
        required: false, 
        type: String,
        description: 'Từ khóa tìm kiếm (tên, email, số điện thoại)',
        example: 'nguyen'
    })
    @ApiQuery({ 
        name: 'page', 
        required: false, 
        type: Number,
        description: 'Số trang',
        example: 1
    })
    @ApiQuery({ 
        name: 'limit', 
        required: false, 
        type: Number,
        description: 'Số lượng item trên mỗi trang',
        example: 10
    })
    findAll(
        @Query('q') q?: string,
        @Query('page') page?: number,
        @Query('limit') limit?: number
    ) {
        const pageNum = page ? Number(page) : 1;
        const limitNum = limit ? Number(limit) : 10;
        return this.userService.findAll(q, pageNum, limitNum);
    }
}
