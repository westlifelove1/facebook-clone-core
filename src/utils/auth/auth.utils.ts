import { JwtService } from '@nestjs/jwt';
import { generateTokens } from '../token/jwt.utils';
import { Repository } from 'typeorm';
import { User } from '../../modules/backend/user/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { generateRandomPassword } from '../token/jwt-encrypt.utils';
import { integer } from '@elastic/elasticsearch/lib/api/types';

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: {
        email: string;
        fullname: string;
        id: integer;
    };
}

export interface CreateUserData {
    email: string;
    fullname: string;
    password?: string;
    profilepic?: string;
}

export const generateAuthResponse = ( jwtService: JwtService, user: User): AuthResponse => {
   
    const payload = {
        sub: user.id,
        email: user.email,
        fullname: user.fullname,
    };

    const tokens = generateTokens(jwtService, payload);

    return {
        ...tokens,
        user: {
            email: user.email,
            fullname: user.fullname,
            id: user.id,
        }
    };
};

export const createNewUser = async (   
    userRepository: Repository<User>,
    data: CreateUserData,
): Promise<User> => {
    // Hash password if provided, otherwise generate random password
    const password = data.password || generateRandomPassword();
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = userRepository.create({...data, password: hashedPassword,});
    const userNew = await userRepository.save(user);

    return userNew;
}; 