import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { DormitoriesService } from "./dormitories.service";
import { DormitoriesController } from "./dormitories.controller";
import { Dormitory } from "./models/dormitory.model";
import { DormitoryRoom } from "./models/dormitory-room.model";
// import { InfoStudent } from "../info-students/models/info-student.model";
import { DormitoryRoomsService } from "../dormitory_rooms/dormitory_rooms.service";

@Module({
  imports: [
    SequelizeModule.forFeature([
      Dormitory,
      DormitoryRoom,
      // InfoStudent
    ]),
  ],
  controllers: [DormitoriesController],
  providers: [DormitoriesService, DormitoryRoomsService],
  exports: [DormitoriesService, DormitoryRoomsService],
})
export class DormitoriesModule {}
