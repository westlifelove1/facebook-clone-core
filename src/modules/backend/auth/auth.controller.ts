import { Controller, Post, Body, Headers, UnauthorizedException, Req } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Public } from 'src/decorators/public.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiHeader } from '@nestjs/swagger';
import { AuthResponseDto, RefreshTokenResponseDto } from './dto/auth-response.dto';

@ApiTags('Backend / Auth')
@Controller()
@Public()
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    @ApiOperation({ summary: 'Đăng nhập bằng email và password' })
    @ApiBody({
        type: LoginDto,
        description: 'Thông tin đăng nhập',
        examples: {
            example1: {
                value: {
                    email: 'email@careerviet.vn',
                    password: '123456',
                }
            }
        }
    })
    @ApiResponse({
        status: 200,
        description: 'Đăng nhập thành công',
        type: AuthResponseDto
    })
    async login(@Body() loginDto: LoginDto, @Req() req: Request) {
        return this.authService.login(loginDto, req);
    }

    @Post('login-google-firebase')
    @ApiOperation({ summary: 'Đăng nhập bằng Google thông qua Firebase' })
    @ApiHeader({
        name: 'authorization',
        description: 'Firebase token',
        required: true,
        schema: {
            type: 'string',
            example: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
        }
    })
    @ApiResponse({
        status: 200,
        description: 'Đăng nhập thành công',
        type: AuthResponseDto
    })
    async loginGG(@Headers('authorization') authHeader: string, @Req() req: Request) {
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('Invalid authorization header format');
        }
        const token = authHeader.split(' ')[1];
        return this.authService.loginGG(token, req);
    }

    @Post('login-google-supabase')
    @ApiOperation({ summary: 'Đăng nhập bằng Google thông qua Supabase' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                token: {
                    type: 'string',
                    example: 'google_oauth_token'
                }
            }
        }
    })
    @ApiResponse({
        status: 200,
        description: 'Đăng nhập thành công',
        type: AuthResponseDto
    })
    async loginSupabase(@Body('token') token: string, @Req() req: Request) {
        return this.authService.loginSupabase(token, req);
    }

    @Post('refresh-token')
    @ApiOperation({ summary: 'Làm mới access token' })
    @ApiBody({
        type: RefreshTokenDto,
        description: 'Refresh token',
        examples: {
            example1: {
                value: {
                    refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                }
            }
        }
    })
    @ApiResponse({
        status: 200,
        description: 'Làm mới token thành công',
        type: RefreshTokenResponseDto
    })
    async refreshToken(@Body() refreshTokenDto: RefreshTokenDto, @Req() req: Request) {
        return this.authService.refreshToken(refreshTokenDto, req);
    }
} 