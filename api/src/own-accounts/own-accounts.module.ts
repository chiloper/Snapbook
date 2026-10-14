import { Module } from '@nestjs/common';
import { OwnAccountsService } from './own-accounts.service';
import { OwnAccountsController } from './own-accounts.controller';

@Module({
  controllers: [OwnAccountsController],
  providers: [OwnAccountsService],
  exports: [OwnAccountsService],
})
export class OwnAccountsModule {}
