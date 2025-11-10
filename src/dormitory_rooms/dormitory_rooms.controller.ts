import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from "@nestjs/common";
import { DormitoryRoomsService } from "./dormitory_rooms.service";
import { CreateDormitoryRoomDto } from "./dto/create-dormitory_room.dto";
import { UpdateDormitoryRoomDto } from "./dto/update-dormitory_room.dto";

@Controller("dormitory-rooms")
export class DormitoryRoomsController {
  constructor(private readonly dormitoryRoomsService: DormitoryRoomsService) {}

  @Post()
  create(@Body() createDormitoryRoomDto: CreateDormitoryRoomDto) {
    return this.dormitoryRoomsService.create(createDormitoryRoomDto);
  }

  // @Get()
  // findAll() {
  //   return this.dormitoryRoomsService.findAll();
  // }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.dormitoryRoomsService.findOne(+id);
  }

  // @Patch(":id")
  // update(
  //   @Param("id") id: string,
  //   @Body() updateDormitoryRoomDto: UpdateDormitoryRoomDto
  // ) {
  //   return this.dormitoryRoomsService.update(+id, updateDormitoryRoomDto);
  // }

  // @Delete(":id")
  // remove(@Param("id") id: string) {
  //   return this.dormitoryRoomsService.remove(+id);
  // }
}
