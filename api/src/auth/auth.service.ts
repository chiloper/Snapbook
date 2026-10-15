import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  Logger,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../supabase/supabase.service';
import {
  ChangePasswordDto,
  ForgotPasswordDto,
  LoginDto,
  RefreshTokenDto,
  RegisterDto,
  ResetPasswordDto,
} from './dto/auth.dto';
import {
  RegisterSuccessResponse,
  SessionResponse,
} from './interfaces/session-response.interface';
import { mapSupabaseAuthError } from './utils/auth-error-mapper';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly supabase: SupabaseService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<RegisterSuccessResponse> {
    const requireEmailConfirm =
      this.configService.get<string>('AUTH_REQUIRE_EMAIL_CONFIRM', 'true') !==
      'false';

    if (!requireEmailConfirm) {
      // Create user immediately with confirmed email via admin API
      const { data: adminData, error: adminError } = await this.supabase
        .getClient()
        .auth.admin.createUser({
          email: dto.email,
          password: dto.password,
          email_confirm: true,
          user_metadata: {
            display_name: dto.display_name,
          },
        });

      if (adminError || !adminData?.user) {
        const errorMsg = mapSupabaseAuthError(adminError, 'register');
        if (errorMsg === 'อีเมลนี้ถูกใช้แล้ว') {
          throw new ConflictException(errorMsg);
        }
        throw new BadRequestException(errorMsg);
      }

      // Log in immediately using a fresh anon client
      const anonClient = this.supabase.createAnonClient();
      const { data: loginData, error: loginError } =
        await anonClient.auth.signInWithPassword({
          email: dto.email,
          password: dto.password,
        });

      if (loginError || !loginData?.session || !loginData?.user) {
        throw new UnauthorizedException(mapSupabaseAuthError(loginError, 'login'));
      }

      return {
        access_token: loginData.session.access_token,
        refresh_token: loginData.session.refresh_token,
        expires_at: loginData.session.expires_at || 0,
        user: {
          id: loginData.user.id,
          email: loginData.user.email || dto.email,
          display_name: dto.display_name,
        },
      };
    }

    // Default flow: sign up using anon client
    const anonClient = this.supabase.createAnonClient();
    const { data, error } = await anonClient.auth.signUp({
      email: dto.email,
      password: dto.password,
      options: {
        data: {
          display_name: dto.display_name,
        },
      },
    });

    if (error) {
      const errorMsg = mapSupabaseAuthError(error, 'register');
      if (errorMsg === 'อีเมลนี้ถูกใช้แล้ว') {
        throw new ConflictException(errorMsg);
      }
      throw new BadRequestException(errorMsg);
    }

    if (data.session && data.user) {
      return {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at || 0,
        user: {
          id: data.user.id,
          email: data.user.email || dto.email,
          display_name: dto.display_name,
        },
      };
    }

    return {
      requires_confirmation: true,
      message: 'กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ',
    };
  }

  async login(dto: LoginDto): Promise<SessionResponse> {
    const anonClient = this.supabase.createAnonClient();
    const { data, error } = await anonClient.auth.signInWithPassword({
      email: dto.email,
      password: dto.password,
    });

    if (error || !data?.session || !data?.user) {
      const errorMsg = mapSupabaseAuthError(error, 'login');
      throw new UnauthorizedException(errorMsg);
    }

    const displayName =
      data.user.user_metadata?.display_name ||
      data.user.email?.split('@')[0] ||
      '';

    return {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at || 0,
      user: {
        id: data.user.id,
        email: data.user.email || dto.email,
        display_name: displayName,
      },
    };
  }

  async refresh(dto: RefreshTokenDto): Promise<SessionResponse> {
    const anonClient = this.supabase.createAnonClient();
    const { data, error } = await anonClient.auth.refreshSession({
      refresh_token: dto.refresh_token,
    });

    if (error || !data?.session || !data?.user) {
      const errorMsg = mapSupabaseAuthError(error, 'refresh');
      throw new UnauthorizedException({
        statusCode: 401,
        message: errorMsg,
        error: 'TOKEN_EXPIRED',
      });
    }

    const displayName =
      data.user.user_metadata?.display_name ||
      data.user.email?.split('@')[0] ||
      '';

    return {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at || 0,
      user: {
        id: data.user.id,
        email: data.user.email || '',
        display_name: displayName,
      },
    };
  }

  async logout(accessToken: string) {
    try {
      await this.supabase.getClient().auth.admin.signOut(accessToken);
    } catch (err: any) {
      this.logger.warn(`Admin signOut warning: ${err.message}`);
    }

    return {
      success: true,
      message: 'ออกจากระบบสำเร็จ',
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const configuredFrontend = this.configService.get<string>(
      'FRONTEND_URL',
      'https://chiloper.github.io/Snapbook',
    );

    let redirectTo = `${configuredFrontend.replace(/\/$/, '')}/reset-password`;
    if (dto.redirect_to && dto.redirect_to.startsWith('http')) {
      redirectTo = dto.redirect_to;
    }

    this.logger.log(`Sending password reset email for ${dto.email} with redirectTo: ${redirectTo}`);

    try {
      const anonClient = this.supabase.createAnonClient();
      await anonClient.auth.resetPasswordForEmail(dto.email, {
        redirectTo,
      });
    } catch (err: any) {
      this.logger.warn(`Password reset attempt error: ${err.message}`);
    }

    // Always return identical message whether email exists or not
    return {
      success: true,
      message:
        'หากอีเมลนี้มีอยู่ในระบบ เราได้ส่งลิงก์สำหรับรีเซ็ตรหัสผ่านไปยังอีเมลของคุณแล้ว',
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    // 1. Validate recovery token
    const { data, error } = await this.supabase
      .getClient()
      .auth.getUser(dto.access_token);

    if (error || !data?.user) {
      throw new BadRequestException(mapSupabaseAuthError(error, 'recovery'));
    }

    // 2. Update password for user
    const { error: updateError } = await this.supabase
      .getClient()
      .auth.admin.updateUserById(data.user.id, {
        password: dto.new_password,
      });

    if (updateError) {
      throw new BadRequestException(
        mapSupabaseAuthError(updateError, 'password_change'),
      );
    }

    return {
      success: true,
      message: 'รีเซ็ตรหัสผ่านสำเร็จ',
    };
  }

  async changePassword(
    userId: string,
    userEmail: string,
    dto: ChangePasswordDto,
  ) {
    // Verify current password first
    const anonClient = this.supabase.createAnonClient();
    const { error: verifyError } = await anonClient.auth.signInWithPassword({
      email: userEmail,
      password: dto.current_password,
    });

    if (verifyError) {
      throw new BadRequestException('รหัสผ่านปัจจุบันไม่ถูกต้อง');
    }

    // Update password
    const { error: updateError } = await this.supabase
      .getClient()
      .auth.admin.updateUserById(userId, {
        password: dto.new_password,
      });

    if (updateError) {
      throw new BadRequestException(
        mapSupabaseAuthError(updateError, 'password_change'),
      );
    }

    return {
      success: true,
      message: 'เปลี่ยนรหัสผ่านสำเร็จ',
    };
  }

  async resendConfirmation(email: string) {
    try {
      const anonClient = this.supabase.createAnonClient();
      await anonClient.auth.resend({
        type: 'signup',
        email,
      });
    } catch (err: any) {
      this.logger.warn(`Resend confirmation error: ${err.message}`);
    }

    return {
      success: true,
      message: 'หากอีเมลนี้รอการยืนยัน เราได้ส่งลิงก์ยืนยันไปยังอีเมลของคุณอีกครั้งแล้ว',
    };
  }
}
