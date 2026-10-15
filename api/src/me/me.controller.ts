import { Controller, Get, Patch, Body, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../common/interfaces/user.interface';
import { OwnAccountsService } from '../own-accounts/own-accounts.service';
import { SupabaseService } from '../supabase/supabase.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@ApiBearerAuth()
@ApiTags('User Profile')
@Controller('me')
export class MeController {
  constructor(
    private readonly ownAccountsService: OwnAccountsService,
    private readonly supabase: SupabaseService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get current user information and account registration status',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile with display_name and account registration indicator',
  })
  async getProfile(@CurrentUser() user: AuthenticatedUser) {
    const accountCount = await this.ownAccountsService.countByUserId(user.id);

    return {
      id: user.id,
      email: user.email,
      display_name: user.display_name,
      has_registered_accounts: accountCount > 0,
      account_count: accountCount,
    };
  }

  @Patch()
  @ApiOperation({
    summary: 'Update current user profile (display name)',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
  })
  async updateProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateProfileDto,
  ) {
    const { error } = await this.supabase
      .getClient()
      .auth.admin.updateUserById(user.id, {
        user_metadata: {
          display_name: dto.display_name,
        },
      });

    if (error) {
      throw new BadRequestException('ไม่สามารถอัปเดตข้อมูลผู้ใช้ได้');
    }

    return {
      id: user.id,
      email: user.email,
      display_name: dto.display_name,
      message: 'อัปเดตข้อมูลโปรไฟล์สำเร็จ',
    };
  }
}
