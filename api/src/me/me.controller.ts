import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../common/interfaces/user.interface';
import { OwnAccountsService } from '../own-accounts/own-accounts.service';

@ApiBearerAuth()
@ApiTags('User Profile')
@Controller('me')
export class MeController {
  constructor(private readonly ownAccountsService: OwnAccountsService) {}

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
}
