import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }

     async register(createuserDto: CreateUserDto, req: Request) {
        // Check if email already exists
        var email= createuserDto.email;
        const existingUser = await this.userRepository.findOne({ where: { email } });

        if (existingUser) {
            throw new HttpException('Email already exists', HttpStatus.BAD_REQUEST);
        }

        // Hash password if provided
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(createuserDto.password, salt);
        createuserDto.password = hashedPassword;

        const user = this.userRepository.create({...createuserDto, password: hashedPassword,});
        const userNew = await this.userRepository.save(user);

        return {
            message: 'Registration successful',
            data: userNew,
        };
    }

    async findOne(id: number): Promise<any> {
        const user = await this.userRepository.findOne({ where: { id: Number(id) } });
        if (!user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }
        return user;
    }


    async findAll(q?: string, page: number = 1, limit: number = 10): Promise<any> {
        const take = limit;
        const skip = (page - 1) * take;

        const queryBuilder = this.userRepository.createQueryBuilder('user');

        if (q) {
            queryBuilder.where('user.fullname LIKE :q OR user.email LIKE :q', { q: `%${q}%` });
        }

        const [data, total] = await queryBuilder.skip(skip).take(take).getManyAndCount();

        return { data, total, page, pageSize: take, totalPages: Math.ceil(total / take),  };
    }

    async update(id: number, updateUserDto: UpdateUserDto): Promise<any> {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }
        if ('email' in updateUserDto) {
            throw new HttpException('You are not allowed to update email', HttpStatus.BAD_REQUEST);
        }

         if ('password' in updateUserDto) {
            throw new HttpException('You are not allowed to update password', HttpStatus.BAD_REQUEST);
        }

        const {...rest } = updateUserDto;

        const updatedUser = await this.userRepository.save({ ...user, ...rest });
        if (!updatedUser) {
            throw new HttpException('Failed to update user', HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return {
            message: 'User updated successfully',
        };
    }
}
