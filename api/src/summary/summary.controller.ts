import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SummaryService } from './summary.service';
import { QuerySummaryDto } from './dto/summary.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../common/interfaces/user.interface';

@ApiBearerAuth()
@ApiTags('Summary')
@Controller('summary')
export class SummaryController {
  constructor(private readonly summaryService: SummaryService) {}

  @Get()
  @ApiOperation({
    summary: 'Get monthly income/expense summary and comparisons (computed in PostgreSQL)',
    description:
      'Calculates total income, total expense, net, fees, category breakdown, daily series, and percent change compared to previous month for confirmed transactions.',
  })
  @ApiResponse({
    status: 200,
    description: 'Monthly summary data',
  })
  getMonthlySummary(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: QuerySummaryDto,
  ) {
    return this.summaryService.getMonthlySummary(user.id, query.month);
  }
}
