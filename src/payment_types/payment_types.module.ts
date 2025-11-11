import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { PaymentTypesService } from "./payment_types.service";
import { PaymentTypesController } from "./payment_types.controller";
import { PaymentType } from "./models/payment_type.model";
import { Payment } from "../payments/models/payment.model";

@Module({
  imports: [SequelizeModule.forFeature([PaymentType, Payment])],
  controllers: [PaymentTypesController],
  providers: [PaymentTypesService],
  exports: [PaymentTypesService],
})
export class PaymentTypesModule {}
