import { Module } from '@nestjs/common';
import { RentContractsService } from './rent_contracts.service';
import { RentContractsController } from './rent_contracts.controller';

@Module({
  controllers: [RentContractsController],
  providers: [RentContractsService],
})
export class RentContractsModule {}
