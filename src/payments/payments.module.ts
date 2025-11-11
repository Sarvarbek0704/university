import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { PaymentsService } from "./payments.service";
import { PaymentsController } from "./payments.controller";
import { Payment } from "./models/payment.model";
import { Student } from "../students/models/student.model";
import { PaymentType } from "../payment_types/models/payment_type.model";

@Module({
  imports: [SequelizeModule.forFeature([Payment, Student, PaymentType])],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
