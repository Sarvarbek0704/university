import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { SubjectsService } from "./subjects.service";
import { SubjectsController } from "./subjects.controller";
import { Subject } from "./models/subject.model";
import { Department } from "../departments/models/department.model";
import { TeacherSubject } from "../teacher_subjects/models/teacher_subject.model";

@Module({
  imports: [SequelizeModule.forFeature([Subject, Department, TeacherSubject])],
  controllers: [SubjectsController],
  providers: [SubjectsService],
  exports: [SubjectsService],
})
export class SubjectsModule {}
