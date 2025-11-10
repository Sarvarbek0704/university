import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { FacultiesService } from "./faculties.service";
import { FacultiesController } from "./faculties.controller";
import { Faculty } from "./models/faculty.model";

@Module({
  imports: [SequelizeModule.forFeature([Faculty])],
  controllers: [FacultiesController],
  providers: [FacultiesService],
  exports: [FacultiesService],
})
export class FacultiesModule {}
