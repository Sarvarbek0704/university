import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { EducationTypesService } from "./education_types.service";
import { EducationTypesController } from "./education_types.controller";
import { EducationType } from "./models/education_type.model";

@Module({
  imports: [SequelizeModule.forFeature([EducationType])],
  controllers: [EducationTypesController],
  providers: [EducationTypesService],
  exports: [EducationTypesService],
})
export class EducationTypesModule {}
