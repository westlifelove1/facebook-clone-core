import { Injectable, BadRequestException, HttpStatus, HttpException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
/* import { Auth } from './entities/auth.entity'; */
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import configuration from 'src/config/configuration';
import { generateTokens } from 'src/utils/token/jwt.utils';
import { User } from 'src/modules/backend/user/entities/user.entity';
import axios from 'axios';
import * as adminGG from 'firebase-admin';
import { generateAuthResponse, createNewUser } from 'src/utils/auth/auth.utils';
import { LogsService } from 'src/modules/backend/logs/logs.service';
import { LogAction } from 'src/modules/backend/logs/entities/log.entity';
import * as admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';
import { ForgotPasswordDto } from '../user/dto/forgot-password.dto';
import { ResetPasswordDto } from '../user/dto/reset-password.dto';
import * as nodemailer from 'nodemailer';


@Injectable()
export class AuthService {
    constructor(
       /*  @InjectRepository(Auth)
        private authRepository: Repository<Auth>, */
        private jwtService: JwtService,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private logsService: LogsService,
    ) { }

    async login(loginDto: LoginDto) {
        const { email, password } = loginDto;
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            throw new HttpException('Invalid email or password', HttpStatus.BAD_REQUEST);
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new HttpException('Invalid email or password', HttpStatus.BAD_REQUEST);
        }
        return generateAuthResponse(this.jwtService, user);
    }

    async refreshToken(refreshTokenDto: RefreshTokenDto) {
        const { refreshToken } = refreshTokenDto;
        let decoded: any;
        try {
            decoded = this.jwtService.verify(refreshToken, {
                secret: configuration().jwt.refresh,
            });
        } catch (err) {
            throw new BadRequestException('Invalid refresh token');
        }
        const payload = { sub: decoded.sub, email: decoded.email };
        const tokens = generateTokens(this.jwtService, payload);

        await this.logsService.createAuthLog({
            name: `Token refreshed for user ${decoded.email}`,
            action: LogAction.REFRESH_TOKEN,
            other: {
                userId: decoded.sub,
                email: decoded.email
            }
        });

        return {
            ...tokens,
            user: {
                email: payload.email,
            }
        };
    }

    async loginWithGoogle(idToken: string) {
        if (!idToken) {
            throw new BadRequestException('No token provided');
        }
         let decodedToken: admin.auth.DecodedIdToken;
         
        try {
            const decodedToken = await adminGG.auth().verifyIdToken(idToken);
            await this.logsService.createAuthLog({
                name: `Google login attempt for ${decodedToken.email}`,
                action: LogAction.LOGIN,
                other: {
                    email: decodedToken.email,
                    provider: 'google'
                }
            });
            
            const email = decodedToken.email;
            if (!email) {
                throw new UnauthorizedException('Google account does not have an email');
            }

             // Kiểm tra user có tồn tại chưa
             let existingUser = await this.userRepository.findOne({ where: { email } });

            if (existingUser) {
                await this.logsService.createAuthLog({
                    name: `Google login for existing user ${existingUser.fullname}`,
                    action: LogAction.LOGIN,
                    user_id: existingUser.id.toString(),
                    other: {
                        email: existingUser.email,
                        provider: 'google'
                    }
                });
                return generateAuthResponse(this.jwtService, existingUser);
            }

             // Create new user
            const fullname = decodedToken.name;
            const profilepic = decodedToken.picture;
            const newUser = await createNewUser( this.userRepository, { email, fullname, profilepic });
            if (newUser) {
                await this.logsService.createAuthLog({
                    name: `New user registered via Google: ${fullname}`,
                    action: LogAction.REGISTER,
                    user_id: newUser.id.toString(),
                    other: {
                        email: newUser.email,
                        provider: 'google'
                    }
                });

                const payload = {
                    sub: newUser.id,
                    email: newUser.email,
                    fullname: newUser.fullname
                };
                const tokens = generateTokens(this.jwtService, payload);
                return {
                    ...tokens,
                    user: {
                        email: newUser.email,
                        fullname: newUser.fullname,
                        id: newUser.id,
                        profilepic: newUser.profilepic || '',
                    }
                };
            };
        } catch (err) {
            throw new BadRequestException('Invalid token');
        }
    }

    async forgotPassword(dto: ForgotPasswordDto) {
        const user = await this.userRepository.findOne({ where: { email: dto.email } });
        if (!user) return; 

        const token = uuidv4(); 
        user.resetToken = token;
        user.resetTokenExpired = new Date(Date.now() + 3600 * 1000); // 1 hour expiry

        await this.userRepository.save(user);

        const resetLink = `https://localhost:3000/reset-password?token=${token}`;

        const transporter = nodemailer.createTransport({
            host: 'mail.talentnetwork.vn',        
            port: 587,                     
            secure: false,                  // true for port 465, false for 587
            auth: {
                user: 'hrvietnam.support@talentnetwork.vn',       
                pass: 'VsLqprLRIdw26',   
            },
        });
        await transporter.sendMail({
            from: '"Facebook Clone" <facebookclone@gmail.com>',
            to: 'vinh.huynh@mail.careerviet.vn',//user.email,
            subject: 'Reset Your Password',
            html: `Click here to reset your password: <a href="${resetLink}">${resetLink}</a>`,
        });

        console.log(`Password reset link: ${resetLink}`);
    }

    async resetPassword(dto: ResetPasswordDto) {
        const user = await this.userRepository.findOne({ where: { resetToken: dto.token } });
        if (!user || user.resetTokenExpired < new Date()) {
            throw new BadRequestException('Token is invalid or expired');
        }

        user.password = await bcrypt.hash(dto.newPassword, 10);
        user.resetToken = "";
        let resetTokenExpired: Date | null = null; 
        resetTokenExpired = new Date(); 
        
        await this.userRepository.save(user);
        return { message: 'Password has been reset successfully' };
    }

    /* async loginSupabase(accessToken: string) {
        try {
            const res = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo?alt=json', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const data = res.data as {
                email: string;
                name: string;
                profilepic: string;
                id: string;
            };

            const { email, name: fullname, profilepic: profilepic, id: googleId } = data;

            if (!email || !googleId) {
                throw new HttpException('Google không trả thông tin đầy đủ', HttpStatus.UNAUTHORIZED);
            }

            // Tìm user hoặc tạo mới
            const existingUser = await this.userRepository.findOne({ where: { email }  });

            //user exists
            if (existingUser) {
                await this.logsService.createAuthLog({
                    name: `Google login for existing user ${fullname}`,
                    action: LogAction.LOGIN,
                    user_id: existingUser.id.toString(),
                    other: {
                        email: existingUser.email,
                        provider: 'google'
                    }
                });
                return generateAuthResponse(this.jwtService, existingUser);
            }

            // Create new user
            const newUser = await createNewUser( this.userRepository, { email, fullname, profilepic });

            if (newUser) {
                await this.logsService.createAuthLog({
                    name: `New user registered via Google: ${fullname}`,
                    action: LogAction.REGISTER,
                    user_id: newUser.id.toString(),
                    other: {
                        email: newUser.email,
                        provider: 'google'
                    }
                });

                const payload = {
                    sub: newUser.id,
                    email: newUser.email,
                    fullname: newUser.fullname,
                    googleId: googleId
                };
                const tokens = generateTokens(this.jwtService, payload);
                return {
                    ...tokens,
                    user: {
                        email: newUser.email,
                        fullname: newUser.fullname,
                        id: newUser.id,
                        profilepic: newUser.profilepic || '',
                    }
                };
            }
        } catch (error) {
            console.error('❌ Google token invalid:', error?.response?.data || error.message);
            throw new HttpException('Google token invalid', HttpStatus.UNAUTHORIZED);
        }
    } */
} 