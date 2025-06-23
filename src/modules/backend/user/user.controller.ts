import { Controller, Get, Post, Body, Param, Query, Put, Request, Req, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiQuery, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { ResponseUserDto } from './dto/response-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Public }  from 'src/decorators/public.decorator'; 


@ApiTags('Backend / User')
@Controller()
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Public()
    @Post('register')
    @ApiOperation({ summary: 'Register a new user' })
    @ApiBody({
        type: CreateUserDto,
        description: 'Registration information for a new user. Email must be unique.',
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
        description: 'Registration successful',
        type: ResponseUserDto
    })
    async register(@Body() createuserDto: CreateUserDto, @Req() req: Request) {
        return this.userService.register(createuserDto, req);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update user information' })
    @ApiBearerAuth('access_token') 
    @ApiParam({ 
        name: 'id', 
        type: 'number', 
        description: 'User ID to update',
        example: 1
    })
    @ApiBody({
        type: UpdateUserDto,
        description: 'Update user information. Email and password cannot be changed',
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
        description: 'Updae user information successfully',
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
    @ApiOperation({ summary: 'Get user information by ID' })
    @ApiParam({ 
        name: 'id', 
        type: 'number', 
        description: 'User ID to retrieve',
        example: 1
    })
    @ApiResponse({ 
        status: 200, 
        description: 'User information retrieved successfully',
        schema: {
            example: {
                id: 1,
                fullname: 'Nguyen Van A',
                displayName: 'This is my display name',
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
    @ApiOperation({ summary: 'Search users by name or email' })
    @ApiResponse({ 
        status: 200, 
        description: 'User list retrieved successfully',
        schema: {
            example: {
                items: [
                    {
                       id: 1,
                        fullname: 'Nguyen Van A',
                        displayName: 'This is my display name',
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
                meta: {  total: 1, page: 1, limit: 10, totalPages: 1 }
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

    @Post('change-password')
    @ApiBearerAuth('access_token') 
    @ApiOperation({ summary: 'Change password profile' })
    @ApiBody({
        type: ChangePasswordDto,
        description: 'Change password request body',
        examples: {
            example: {
                value: {
                    currentPassword: '123456',
                    newPassword: 'NewPassword123',
                    confirmNewPassword: 'NewPassword123'
                }
            }
        }
    })
    async changePassword(
        @Request() req,
        @Body() dto: ChangePasswordDto,
    ) {
        const userId = Number(req.user?.sub);
        if (!userId || isNaN(userId)) {
            throw new BadRequestException('ID người dùng không hợp lệ');
        } 
        return this.userService.changePassword(userId, dto);
    }
}
