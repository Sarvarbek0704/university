import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { DepartmentsService } from "./departments.service";
import { DepartmentsController } from "./departments.controller";
import { Department } from "./models/department.model";
import { Faculty } from "../faculties/models/faculty.model";

@Module({
  imports: [SequelizeModule.forFeature([Department, Faculty])],
  controllers: [DepartmentsController],
  providers: [DepartmentsService],
  exports: [DepartmentsService],
})
export class DepartmentsModule {}
