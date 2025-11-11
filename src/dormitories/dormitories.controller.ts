import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
  ParseIntPipe,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from "@nestjs/swagger";
import { DormitoriesService } from "./dormitories.service";
// import { DormitoryRoomsService } from "./dormitory-rooms.service";
import { CreateDormitoryDto } from "./dto/create-dormitory.dto";
import { UpdateDormitoryDto } from "./dto/update-dormitory.dto";
import { CreateDormitoryRoomDto } from "./dto/create-dormitory-room.dto";
import { AssignStudentToRoomDto } from "./dto/assign-student-to-room.dto";
import { FilterDormitoryDto } from "./dto/filter-dormitory.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AdminGuard } from "../auth/guards/admin.guard";
import { DormitoryRoomsService } from "../dormitory_rooms/dormitory_rooms.service";

@ApiTags("dormitories")
@ApiBearerAuth("JWT-auth")
@Controller("dormitories")
export class DormitoriesController {
  constructor(
    private readonly dormitoriesService: DormitoriesService,
    private readonly dormitoryRoomsService: DormitoryRoomsService
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Create a new dormitory" })
  @ApiResponse({ status: 201, description: "Dormitory created successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 409, description: "Dormitory name already exists" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async create(@Body() createDormitoryDto: CreateDormitoryDto) {
    return this.dormitoriesService.create(createDormitoryDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all dormitories with filtering" })
  @ApiResponse({ status: 200, description: "Return all dormitories" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findAll(@Query() filterDto: FilterDormitoryDto) {
    return this.dormitoriesService.findAll(filterDto);
  }

  @Get("stats")
  @ApiOperation({ summary: "Get dormitories statistics" })
  @ApiResponse({ status: 200, description: "Return dormitories statistics" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getStats() {
    return this.dormitoriesService.getDormitoriesStats();
  }

  @Get("available")
  @ApiOperation({ summary: "Get available dormitories with free beds" })
  @ApiResponse({ status: 200, description: "Return available dormitories" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getAvailableDormitories() {
    return this.dormitoriesService.getAvailableDormitories();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get dormitory by ID" })
  @ApiParam({ name: "id", type: Number, description: "Dormitory ID" })
  @ApiResponse({ status: 200, description: "Return dormitory" })
  @ApiResponse({ status: 400, description: "Invalid dormitory ID" })
  @ApiResponse({ status: 404, description: "Dormitory not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findOne(@Param("id", ParseIntPipe) id: number) {
    return this.dormitoriesService.findOne(id);
  }

  @Get(":id/with-rooms")
  @ApiOperation({ summary: "Get dormitory with rooms" })
  @ApiParam({ name: "id", type: Number, description: "Dormitory ID" })
  @ApiResponse({ status: 200, description: "Return dormitory with rooms" })
  @ApiResponse({ status: 400, description: "Invalid dormitory ID" })
  @ApiResponse({ status: 404, description: "Dormitory not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getDormitoryWithRooms(@Param("id", ParseIntPipe) id: number) {
    return this.dormitoriesService.getDormitoryWithRooms(id);
  }

  @Get(":id/stats")
  @ApiOperation({ summary: "Get dormitory statistics" })
  @ApiParam({ name: "id", type: Number, description: "Dormitory ID" })
  @ApiResponse({ status: 200, description: "Return dormitory statistics" })
  @ApiResponse({ status: 400, description: "Invalid dormitory ID" })
  @ApiResponse({ status: 404, description: "Dormitory not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getDormitoryStats(@Param("id", ParseIntPipe) id: number) {
    return this.dormitoriesService.getDormitoryStats(id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Update dormitory" })
  @ApiParam({ name: "id", type: Number, description: "Dormitory ID" })
  @ApiResponse({ status: 200, description: "Dormitory updated successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 404, description: "Dormitory not found" })
  @ApiResponse({ status: 409, description: "Dormitory name already exists" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateDormitoryDto: UpdateDormitoryDto
  ) {
    return this.dormitoriesService.update(id, updateDormitoryDto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete dormitory" })
  @ApiParam({ name: "id", type: Number, description: "Dormitory ID" })
  @ApiResponse({ status: 200, description: "Dormitory deleted successfully" })
  @ApiResponse({ status: 400, description: "Invalid dormitory ID" })
  @ApiResponse({ status: 404, description: "Dormitory not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async remove(@Param("id", ParseIntPipe) id: number) {
    return this.dormitoriesService.remove(id);
  }

  @Patch(":id/toggle-status")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Toggle dormitory active status" })
  @ApiParam({ name: "id", type: Number, description: "Dormitory ID" })
  @ApiResponse({ status: 200, description: "Status updated successfully" })
  @ApiResponse({ status: 400, description: "Invalid dormitory ID" })
  @ApiResponse({ status: 404, description: "Dormitory not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async toggleStatus(@Param("id", ParseIntPipe) id: number) {
    return this.dormitoriesService.toggleStatus(id);
  }

  @Post("rooms")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Create a new dormitory room" })
  @ApiResponse({ status: 201, description: "Room created successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 404, description: "Dormitory not found" })
  @ApiResponse({
    status: 409,
    description: "Room number already exists in this dormitory",
  })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async createRoom(@Body() createRoomDto: CreateDormitoryRoomDto) {
    return this.dormitoryRoomsService.create(createRoomDto);
  }

  @Get("rooms/:roomId")
  @ApiOperation({ summary: "Get dormitory room by ID" })
  @ApiParam({ name: "roomId", type: Number, description: "Room ID" })
  @ApiResponse({ status: 200, description: "Return room" })
  @ApiResponse({ status: 400, description: "Invalid room ID" })
  @ApiResponse({ status: 404, description: "Room not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findRoom(@Param("roomId", ParseIntPipe) roomId: number) {
    return this.dormitoryRoomsService.findOne(roomId);
  }

  @Get(":id/rooms")
  @ApiOperation({ summary: "Get all rooms in a dormitory" })
  @ApiParam({ name: "id", type: Number, description: "Dormitory ID" })
  @ApiResponse({ status: 200, description: "Return rooms" })
  @ApiResponse({ status: 400, description: "Invalid dormitory ID" })
  @ApiResponse({ status: 404, description: "Dormitory not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getDormitoryRooms(@Param("id", ParseIntPipe) id: number) {
    return this.dormitoryRoomsService.findByDormitory(id);
  }

  @Get("rooms/:roomId/with-students")
  @ApiOperation({ summary: "Get room with students" })
  @ApiParam({ name: "roomId", type: Number, description: "Room ID" })
  @ApiResponse({ status: 200, description: "Return room with students" })
  @ApiResponse({ status: 400, description: "Invalid room ID" })
  @ApiResponse({ status: 404, description: "Room not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getRoomWithStudents(@Param("roomId", ParseIntPipe) roomId: number) {
    return this.dormitoryRoomsService.getRoomWithStudents(roomId);
  }

  @Post("rooms/assign-student")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Assign student to dormitory room" })
  @ApiResponse({ status: 200, description: "Student assigned successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 404, description: "Student or room not found" })
  @ApiResponse({
    status: 409,
    description: "Room is full or student already assigned",
  })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async assignStudentToRoom(@Body() assignDto: AssignStudentToRoomDto) {
    return this.dormitoryRoomsService.assignStudentToRoom(assignDto);
  }

  @Delete("rooms/:roomId/students/:studentId")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Remove student from dormitory room" })
  @ApiParam({ name: "roomId", type: Number, description: "Room ID" })
  @ApiParam({ name: "studentId", type: Number, description: "Student ID" })
  @ApiResponse({ status: 200, description: "Student removed successfully" })
  @ApiResponse({ status: 400, description: "Invalid IDs" })
  @ApiResponse({ status: 404, description: "Room or student not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async removeStudentFromRoom(
    @Param("roomId", ParseIntPipe) roomId: number,
    @Param("studentId", ParseIntPipe) studentId: number
  ) {
    return this.dormitoryRoomsService.removeStudentFromRoom(roomId, studentId);
  }
}
