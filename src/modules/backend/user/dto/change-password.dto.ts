import { IsString, MinLength, Matches } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  currentPassword: string;

  @IsString()
  @MinLength(6)
  @Matches(/^(?=.*[A-Z])(?=.*\d).+$/, {
    message: 'New password must contain at least one uppercase letter and one number',
  })
  newPassword: string;

  @IsString()
  confirmNewPassword: string;
}
