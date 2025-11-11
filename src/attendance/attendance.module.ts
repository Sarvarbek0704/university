import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { AttendanceService } from "./attendance.service";
import { AttendanceController } from "./attendance.controller";
import { Attendance } from "./models/attendance.model";
import { Student } from "../students/models/student.model";
import { Schedule } from "../schedules/models/schedule.model";
import { Group } from "../groups/models/group.model";
import { Subject } from "../subjects/models/subject.model";
import { Teacher } from "../teachers/models/teacher.model";
import { Classroom } from "../classrooms/models/classroom.model";

@Module({
  imports: [
    SequelizeModule.forFeature([
      Attendance,
      Student,
      Schedule,
      Group,
      Subject,
      Teacher,
      Classroom,
    ]),
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports: [AttendanceService],
})
export class AttendanceModule {}
