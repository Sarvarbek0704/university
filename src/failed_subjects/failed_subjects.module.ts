import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { FailedSubjectsService } from "./failed_subjects.service";
import { FailedSubjectsController } from "./failed_subjects.controller";
import { FailedSubject } from "./models/failed_subject.model";
import { Student } from "../students/models/student.model";
import { Subject } from "../subjects/models/subject.model";
import { ExamAttempt } from "../exam_attempts/models/exam_attempt.model";
import { Group } from "../groups/models/group.model";
import { Faculty } from "../faculties/models/faculty.model";
import { Department } from "../departments/models/department.model";
import { ExamResult } from "../exam_results/models/exam_result.model";

@Module({
  imports: [
    SequelizeModule.forFeature([
      FailedSubject,
      Student,
      Subject,
      ExamAttempt,
      Group,
      Faculty,
      Department,
      ExamResult,
    ]),
  ],
  controllers: [FailedSubjectsController],
  providers: [FailedSubjectsService],
  exports: [FailedSubjectsService],
})
export class FailedSubjectsModule {}
