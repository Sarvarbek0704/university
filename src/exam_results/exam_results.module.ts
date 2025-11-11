import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { ExamResultsService } from "./exam_results.service";
import { ExamResultsController } from "./exam_results.controller";
import { ExamResult } from "./models/exam_result.model";
import { Exam } from "../exams/models/exam.model";
import { Student } from "../students/models/student.model";
import { Subject } from "../subjects/models/subject.model";
import { Group } from "../groups/models/group.model";
import { Teacher } from "../teachers/models/teacher.model";

@Module({
  imports: [
    SequelizeModule.forFeature([
      ExamResult,
      Exam,
      Student,
      Subject,
      Group,
      Teacher,
    ]),
  ],
  controllers: [ExamResultsController],
  providers: [ExamResultsService],
  exports: [ExamResultsService],
})
export class ExamResultsModule {}
