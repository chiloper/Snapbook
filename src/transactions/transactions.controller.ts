import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import {
  BulkConfirmTransactionsDto,
  CreateTransactionDto,
  QueryTransactionsDto,
  UpdateTransactionDto,
} from './dto/transaction.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../common/interfaces/user.interface';

@ApiBearerAuth()
@ApiTags('Transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get paginated list of transactions with optional filters' })
  @ApiResponse({ status: 200, description: 'Paginated transactions list' })
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: QueryTransactionsDto,
  ) {
    return this.transactionsService.findAll(user.id, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get transaction details by ID' })
  @ApiResponse({ status: 200, description: 'Transaction details' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  findOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.transactionsService.findOne(user.id, id);
  }

  @Post()
  @ApiOperation({ summary: 'Manual entry for income/expense transaction (status confirmed)' })
  @ApiResponse({ status: 201, description: 'Transaction created' })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateTransactionDto,
  ) {
    return this.transactionsService.create(user.id, dto);
  }

  @Post('confirm-bulk')
  @ApiOperation({ summary: 'Bulk confirm pending review transactions' })
  @ApiResponse({ status: 200, description: 'Transactions confirmed' })
  confirmBulk(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: BulkConfirmTransactionsDto,
  ) {
    return this.transactionsService.confirmBulk(user.id, dto.ids);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update transaction (automatically marks as confirmed)' })
  @ApiResponse({ status: 200, description: 'Transaction updated' })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateTransactionDto,
  ) {
    return this.transactionsService.update(user.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete transaction and its associated slip image if present' })
  @ApiResponse({ status: 200, description: 'Transaction and slip deleted' })
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.transactionsService.remove(user.id, id);
  }
}
