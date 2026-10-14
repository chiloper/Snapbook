import { Module } from '@nestjs/common';
import { SlipsController } from './slips.controller';
import { SlipsService } from './slips.service';
import { ExtractionModule } from '../extraction/extraction.module';
import { OwnAccountsModule } from '../own-accounts/own-accounts.module';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  imports: [ExtractionModule, OwnAccountsModule, CategoriesModule],
  controllers: [SlipsController],
  providers: [SlipsService],
  exports: [SlipsService],
})
export class SlipsModule {}
