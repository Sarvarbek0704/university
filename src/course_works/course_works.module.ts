import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { CourseWorksService } from "./course_works.service";
import { CourseWorksController } from "./course_works.controller";
import { CourseWork } from "./models/course_work.model";
import { Student } from "../students/models/student.model";
import { Subject } from "../subjects/models/subject.model";

@Module({
  imports: [SequelizeModule.forFeature([CourseWork, Student, Subject])],
  controllers: [CourseWorksController],
  providers: [CourseWorksService],
  exports: [CourseWorksService],
})
export class CourseWorksModule {}
