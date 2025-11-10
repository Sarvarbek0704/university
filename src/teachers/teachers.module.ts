import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { TeacherService } from "./teachers.service";
import { TeacherController } from "./teachers.controller";
import { Teacher } from "./models/teacher.model";
import { Department } from "../departments/models/department.model";
import { DepartmentsModule } from "../departments/departments.module";

@Module({
  imports: [
    SequelizeModule.forFeature([Teacher, Department]),
    DepartmentsModule,
  ],
  controllers: [TeacherController],
  providers: [TeacherService],
  exports: [TeacherService],
})
export class TeachersModule {}
