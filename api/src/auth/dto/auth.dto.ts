import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com', description: 'User email' })
  @IsEmail({}, { message: 'รูปแบบอีเมลไม่ถูกต้อง' })
  email!: string;

  @ApiProperty({ example: 'Password123!', minLength: 8, description: 'Password (min 8 chars)' })
  @IsString()
  @MinLength(8, { message: 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร' })
  password!: string;

  @ApiProperty({ example: 'สมชาย ใจดี', description: 'User display name' })
  @IsString()
  @IsNotEmpty({ message: 'กรุณาระบุชื่อที่แสดง (display name)' })
  display_name!: string;
}

export class LoginDto {
  @ApiProperty({ example: 'user@example.com', description: 'User email' })
  @IsEmail({}, { message: 'รูปแบบอีเมลไม่ถูกต้อง' })
  email!: string;

  @ApiProperty({ example: 'Password123!', description: 'User password' })
  @IsString()
  @IsNotEmpty({ message: 'กรุณาระบุรหัสผ่าน' })
  password!: string;
}

export class RefreshTokenDto {
  @ApiProperty({ example: 'v1.Mrh...', description: 'Supabase refresh token' })
  @IsString()
  @IsNotEmpty({ message: 'กรุณาระบุ refresh_token' })
  refresh_token!: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'user@example.com', description: 'User email for recovery' })
  @IsEmail({}, { message: 'รูปแบบอีเมลไม่ถูกต้อง' })
  email!: string;

  @ApiProperty({
    example: 'https://chiloper.github.io/Snapbook/reset-password',
    required: false,
    description: 'Frontend redirect URL for password reset',
  })
  @IsOptional()
  @IsString()
  redirect_to?: string;
}

export class ResetPasswordDto {
  @ApiProperty({ example: 'eyJhbGciOi...', description: 'Recovery access token' })
  @IsString()
  @IsNotEmpty({ message: 'กรุณาระบุ access_token' })
  access_token!: string;

  @ApiProperty({ example: 'NewSecret123!', minLength: 8, description: 'New password' })
  @IsString()
  @MinLength(8, { message: 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 8 ตัวอักษร' })
  new_password!: string;
}

export class ChangePasswordDto {
  @ApiProperty({ example: 'CurrentSecret123!', description: 'Current user password' })
  @IsString()
  @IsNotEmpty({ message: 'กรุณาระบุรหัสผ่านปัจจุบัน' })
  current_password!: string;

  @ApiProperty({ example: 'NewSecret123!', minLength: 8, description: 'New user password' })
  @IsString()
  @MinLength(8, { message: 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 8 ตัวอักษร' })
  new_password!: string;
}
