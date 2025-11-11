import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { RentContractsService } from "./rent_contracts.service";
import { RentContractsController } from "./rent_contracts.controller";
import { RentContract } from "./models/rent_contract.model";
import { Student } from "../students/models/student.model";
import { Installment } from "../installments/models/installment.model";

@Module({
  imports: [SequelizeModule.forFeature([RentContract, Student, Installment])],
  controllers: [RentContractsController],
  providers: [RentContractsService],
  exports: [RentContractsService],
})
export class RentContractsModule {}
