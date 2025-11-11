import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { TeacherSubjectsService } from "./teacher_subjects.service";
import { TeacherSubjectsController } from "./teacher_subjects.controller";
import { Teacher } from "../teachers/models/teacher.model";
import { Subject } from "../subjects/models/subject.model";
import { TeacherSubject } from "./models/teacher_subject.mdoel";

@Module({
  imports: [SequelizeModule.forFeature([TeacherSubject, Teacher, Subject])],
  controllers: [TeacherSubjectsController],
  providers: [TeacherSubjectsService],
  exports: [TeacherSubjectsService],
})
export class TeacherSubjectsModule {}
