import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly supabaseService: SupabaseService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    const path: string = request.path || '';

    // Bypass public endpoints and Swagger docs
    if (isPublic || path.startsWith('/docs') || path === '/health') {
      return true;
    }

    const authHeader = request.headers['authorization'];
    if (!authHeader || typeof authHeader !== 'string') {
      throw new UnauthorizedException('กรุณาเข้าสู่ระบบ (ไม่พบ Authorization Header)');
    }

    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token) {
      throw new UnauthorizedException('รูปแบบโทเค็นไม่ถูกต้อง (Expected Bearer token)');
    }

    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .auth.getUser(token);

      if (error) {
        const errorMsg = (error.message || '').toLowerCase();
        if (
          errorMsg.includes('expired') ||
          errorMsg.includes('jwt expired') ||
          errorMsg.includes('token is expired')
        ) {
          throw new UnauthorizedException({
            statusCode: 401,
            message: 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่',
            error: 'TOKEN_EXPIRED',
          });
        }

        throw new UnauthorizedException('โทเค็นไม่ถูกต้องหรือหมดอายุการใช้งาน');
      }

      if (!data?.user) {
        throw new UnauthorizedException('โทเค็นไม่ถูกต้องหรือหมดอายุการใช้งาน');
      }

      // Extract display_name from user_metadata if present
      const displayName =
        data.user.user_metadata?.display_name ||
        data.user.user_metadata?.full_name ||
        data.user.email?.split('@')[0] ||
        '';

      // Attach authenticated user to request
      request.user = {
        id: data.user.id,
        email: data.user.email || '',
        display_name: displayName,
      };

      return true;
    } catch (err) {
      if (err instanceof UnauthorizedException) {
        throw err;
      }
      throw new UnauthorizedException('การยืนยันตัวตนล้มเหลว');
    }
  }
}
