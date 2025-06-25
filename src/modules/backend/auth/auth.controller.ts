import { Controller, Post, Body, Headers, UnauthorizedException, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Public } from 'src/decorators/public.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiHeader,ApiBearerAuth } from '@nestjs/swagger';
import { AuthResponseDto, RefreshTokenResponseDto } from './dto/auth-response.dto';

@ApiTags('Backend / Auth')
@Controller()
@Public()
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    @ApiOperation({ summary: 'Login by email and password' })
    @ApiBody({
        type: LoginDto,
        description: 'Login information', 
        examples: {
            example1: {
                value: {
                    email: 'email@gmail.com',
                    password: '123456',
                }
            }
        }
    })
    @ApiResponse({
        status: 200,
        description: 'Login successful',
        type: AuthResponseDto
    })
    async login(@Body() loginDto: LoginDto, @Req() req: Request) {
        return this.authService.login(loginDto);
    }

    @Post('login-google-firebase')
    @ApiOperation({ summary: 'Login with Google/Firebase' })
    @ApiBearerAuth('access_token')
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
        description: 'Login successful',
        type: AuthResponseDto
    })
    async loginWithGoogle(@Headers('authorization') authHeader: string) {
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('Invalid authorization header format');
        }
        const token = authHeader.split(' ')[1];
        return this.authService.loginWithGoogle(token);
    }


    @Post('refresh-token')
    @ApiOperation({ summary: 'Refresh access token' })
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
        description: 'Refresh token successful',
        type: RefreshTokenResponseDto
    })
    async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
        return this.authService.refreshToken(refreshTokenDto);
    }


    /*     @Post('login-google-supabase')
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
    } */

} 