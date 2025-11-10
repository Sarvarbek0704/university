import { Module } from '@nestjs/common';
import { PaymentTypesService } from './payment_types.service';
import { PaymentTypesController } from './payment_types.controller';

@Module({
  controllers: [PaymentTypesController],
  providers: [PaymentTypesService],
})
export class PaymentTypesModule {}
