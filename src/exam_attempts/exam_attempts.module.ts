import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { Exam } from "../exams/models/exam.model";
import { Student } from "../students/models/student.model";
import { Subject } from "../subjects/models/subject.model";
import { Group } from "../groups/models/group.model";
import { Teacher } from "../teachers/models/teacher.model";
import { ExamAttempt } from "./models/exam_attempt.model";
import { ExamAttemptsController } from "./exam_attempts.controller";
import { ExamAttemptsService } from "./exam_attempts.service";

@Module({
  imports: [
    SequelizeModule.forFeature([
      ExamAttempt,
      Exam,
      Student,
      Subject,
      Group,
      Teacher,
    ]),
  ],
  controllers: [ExamAttemptsController],
  providers: [ExamAttemptsService],
  exports: [ExamAttemptsService],
})
export class ExamAttemptsModule {}
