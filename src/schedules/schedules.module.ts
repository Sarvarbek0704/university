import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { SchedulesService } from "./schedules.service";
import { SchedulesController } from "./schedules.controller";
import { Schedule } from "./models/schedule.model";
import { Group } from "../groups/models/group.model";
import { Subject } from "../subjects/models/subject.model";
import { Teacher } from "../teachers/models/teacher.model";
import { Classroom } from "../classrooms/models/classroom.model";

@Module({
  imports: [
    SequelizeModule.forFeature([Schedule, Group, Subject, Teacher, Classroom]),
  ],
  controllers: [SchedulesController],
  providers: [SchedulesService],
  exports: [SchedulesService],
})
export class SchedulesModule {}
