import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { DormitoryRoomsService } from "./dormitory_rooms.service";
import { DormitoryRoomsController } from "./dormitory_rooms.controller";
import { DormitoryRoom } from "../dormitories/models/dormitory-room.model";
import { Dormitory } from "../dormitories/models/dormitory.model";
import { InfoStudent } from "../info_students/models/info_student.model";
import { Student } from "../students/models/student.model";

@Module({
  imports: [
    SequelizeModule.forFeature([
      DormitoryRoom,
      Dormitory,
      InfoStudent,
      Student,
    ]),
  ],
  controllers: [DormitoryRoomsController],
  providers: [DormitoryRoomsService],
})
export class DormitoryRoomsModule {}
