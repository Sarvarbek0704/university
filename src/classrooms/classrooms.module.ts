import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { ClassroomsService } from "./classrooms.service";
import { ClassroomsController } from "./classrooms.controller";
import { Classroom } from "./models/classroom.model";
import { Schedule } from "../schedules/models/schedule.model";

@Module({
  imports: [SequelizeModule.forFeature([Classroom, Schedule])],
  controllers: [ClassroomsController],
  providers: [ClassroomsService],
  exports: [ClassroomsService],
})
export class ClassroomsModule {}
