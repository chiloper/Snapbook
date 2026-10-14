import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OwnAccountsService } from './own-accounts.service';
import { CreateOwnAccountDto, UpdateOwnAccountDto } from './dto/own-account.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../common/interfaces/user.interface';

@ApiBearerAuth()
@ApiTags('Own Accounts')
@Controller('own-accounts')
export class OwnAccountsController {
  constructor(private readonly ownAccountsService: OwnAccountsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all registered own accounts for current user' })
  @ApiResponse({ status: 200, description: 'List of own accounts' })
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.ownAccountsService.findAll(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get own account by ID' })
  @ApiResponse({ status: 200, description: 'Own account details' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  findOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.ownAccountsService.findOne(user.id, id);
  }

  @Post()
  @ApiOperation({ summary: 'Register a new own account' })
  @ApiResponse({ status: 201, description: 'Account created' })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateOwnAccountDto,
  ) {
    return this.ownAccountsService.create(user.id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an own account' })
  @ApiResponse({ status: 200, description: 'Account updated' })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateOwnAccountDto,
  ) {
    return this.ownAccountsService.update(user.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an own account' })
  @ApiResponse({ status: 200, description: 'Account deleted' })
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.ownAccountsService.remove(user.id, id);
  }
}
