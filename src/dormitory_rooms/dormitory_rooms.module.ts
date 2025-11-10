import { Module } from '@nestjs/common';
import { DormitoryRoomsService } from './dormitory_rooms.service';
import { DormitoryRoomsController } from './dormitory_rooms.controller';

@Module({
  controllers: [DormitoryRoomsController],
  providers: [DormitoryRoomsService],
})
export class DormitoryRoomsModule {}
