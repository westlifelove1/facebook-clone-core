import { IsEmail, IsNotEmpty, IsString, IsOptional, MaxLength, Matches, MinLength} from "class-validator";

export class CreateUserDto {
    @IsNotEmpty()
    @IsString()
    fullname: string;

    @IsNotEmpty()
    @IsEmail({}, { message: 'Email must be a valid email address' })
    email: string;

    @IsOptional()
    @IsString()
    @MaxLength(10, { message: 'Phone must be at most 10 digits' })
    @Matches(/^\d*$/, { message: 'Phone must contain only digits' })
    phone?: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    password: string;

    @IsString()
    @IsOptional()
    profilepic?: string;

    @IsOptional()
    @IsString()
    coverpic?: string;

    @IsOptional()
    bio?: string;

    @IsOptional()
    birthplace?: string;

    @IsOptional()
    workingPlace?: string;
} 