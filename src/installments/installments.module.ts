import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { InstallmentsService } from "./installments.service";
import { InstallmentsController } from "./installments.controller";
import { Installment } from "./models/installment.model";
import { RentContract } from "../rent_contracts/models/rent_contract.model";
import { Student } from "../students/models/student.model";

@Module({
  imports: [SequelizeModule.forFeature([Installment, RentContract, Student])],
  controllers: [InstallmentsController],
  providers: [InstallmentsService],
  exports: [InstallmentsService],
})
export class InstallmentsModule {}
