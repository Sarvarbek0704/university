import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { HousingTypesService } from "./housing_types.service";
import { HousingTypesController } from "./housing_types.controller";
import { HousingType } from "./models/housing_type.model";

@Module({
  imports: [SequelizeModule.forFeature([HousingType])],
  controllers: [HousingTypesController],
  providers: [HousingTypesService],
  exports: [HousingTypesService],
})
export class HousingTypesModule {}
