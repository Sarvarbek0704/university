import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { ExamsService } from "./exams.service";
import { ExamsController } from "./exams.controller";
import { Exam } from "./models/exam.model";
import { Subject } from "../subjects/models/subject.model";
import { Group } from "../groups/models/group.model";
import { Teacher } from "../teachers/models/teacher.model";
import { ExamResult } from "../exam_results/models/exam_result.model";
import { ExamAttempt } from "../exam_attempts/models/exam_attempt.model";

@Module({
  imports: [
    SequelizeModule.forFeature([
      Exam,
      Subject,
      Group,
      Teacher,
      ExamResult,
      ExamAttempt,
    ]),
  ],
  controllers: [ExamsController],
  providers: [ExamsService],
  exports: [ExamsService],
})
export class ExamsModule {}
