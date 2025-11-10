import { Module } from '@nestjs/common';
import { ScolarshipTransactionsService } from './scolarship_transactions.service';
import { ScolarshipTransactionsController } from './scolarship_transactions.controller';

@Module({
  controllers: [ScolarshipTransactionsController],
  providers: [ScolarshipTransactionsService],
})
export class ScolarshipTransactionsModule {}
