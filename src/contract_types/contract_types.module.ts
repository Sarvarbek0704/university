import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { ContractTypesService } from "./contract_types.service";
import { ContractTypesController } from "./contract_types.controller";
import { ContractType } from "./models/contract_type.model";

@Module({
  imports: [SequelizeModule.forFeature([ContractType])],
  controllers: [ContractTypesController],
  providers: [ContractTypesService],
  exports: [ContractTypesService],
})
export class ContractTypesModule {}
