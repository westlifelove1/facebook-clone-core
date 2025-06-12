import { JwtService } from '@nestjs/jwt';
import { generateTokens } from '../token/jwt.utils';
import { Auth } from '../../modules/backend/auth/entities/auth.entity';
import { Repository } from 'typeorm';
import { User } from '../../modules/backend/user/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { generateRandomPassword } from '../token/jwt-encrypt.utils';

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: {
        email: string;
        fullname: string;
        avatar: string;
    };
}

export interface CreateUserData {
    email: string;
    fullname: string;
    password?: string;
    avatar?: string;
}

export const generateAuthResponse = (
    jwtService: JwtService,
    auth: Auth,
): AuthResponse => {
    const user = auth.user;
   
    const payload = {
        sub: user.id,
        email: user.email,
        fullname: user.fullname,
    };

    const tokens = generateTokens(jwtService, payload);

    return {
        ...tokens,
        user: {
            email: auth.email,
            fullname: auth.fullname,
            avatar: user.avatar,
        }
    };
};

export const createNewUser = async (
    authRepository: Repository<Auth>,
    userRepository: Repository<User>,
    data: CreateUserData,
): Promise<Auth> => {
    // Hash password if provided, otherwise generate random password
    const password = data.password || generateRandomPassword();
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new auth
    const auth = authRepository.create({
        email: data.email,
        fullname: data.fullname,
        password: hashedPassword,
    });

    // Save to database
    const authNew = await authRepository.save(auth);

    if (authNew) {
        // Create user row linked to auth
        const user = userRepository.create({
            fullname: data.fullname,
            email: data.email,
            phone: '',
            avatar: data.avatar || '',
            auth: authNew,
        });
        const userNew = await userRepository.save(user);

        return {
            ...authNew,
            user: userNew,
        };
    }
    return authNew;
}; 