import { Module } from '@nestjs/common';
import { MeController } from './me.controller';
import { OwnAccountsModule } from '../own-accounts/own-accounts.module';

@Module({
  imports: [OwnAccountsModule],
  controllers: [MeController],
})
export class MeModule {}
