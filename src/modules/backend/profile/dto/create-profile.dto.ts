import { IsNotEmpty, IsEnum, IsOptional, IsString, IsDateString } from 'class-validator';

export class CreateProfileDto {
  @IsNotEmpty()
  userId: number;

  @IsOptional()
  @IsString()
  profilePic?: string;

  @IsNotEmpty()
  displayName: string;

  @IsEnum(['male', 'female', 'other'])
  gender: 'male' | 'female' | 'other';

  @IsOptional()
  @IsDateString()
  birthday?: string;

  @IsOptional()
  bio?: string;
}