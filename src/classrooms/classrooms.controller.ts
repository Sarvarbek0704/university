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
import { ClassroomsService } from "./classrooms.service";
import { CreateClassroomDto } from "./dto/create-classroom.dto";
import { UpdateClassroomDto } from "./dto/update-classroom.dto";
import { FilterClassroomDto } from "./dto/filter-classroom.dto";
import { ClassroomAvailabilityDto } from "./dto/classroom-availability.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AdminGuard } from "../auth/guards/admin.guard";

@ApiTags("classrooms")
@ApiBearerAuth("JWT-auth")
@Controller("classrooms")
export class ClassroomsController {
  constructor(private readonly classroomsService: ClassroomsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Create a new classroom" })
  @ApiResponse({ status: 201, description: "Classroom created successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({
    status: 409,
    description: "Classroom with this building and room number already exists",
  })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async create(@Body() createClassroomDto: CreateClassroomDto) {
    return this.classroomsService.create(createClassroomDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all classrooms with filtering" })
  @ApiResponse({ status: 200, description: "Return all classrooms" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findAll(@Query() filterDto: FilterClassroomDto) {
    return this.classroomsService.findAll(filterDto);
  }

  @Get("stats")
  @ApiOperation({ summary: "Get classrooms statistics" })
  @ApiResponse({ status: 200, description: "Return classrooms statistics" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getStats() {
    return this.classroomsService.getClassroomsStats();
  }

  @Get("available")
  @ApiOperation({ summary: "Get available classrooms" })
  @ApiResponse({ status: 200, description: "Return available classrooms" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getAvailableClassrooms() {
    return this.classroomsService.getAvailableClassrooms();
  }

  @Post("check-availability")
  @ApiOperation({ summary: "Check classroom availability for time slot" })
  @ApiResponse({ status: 200, description: "Return availability status" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async checkAvailability(@Body() availabilityDto: ClassroomAvailabilityDto) {
    return this.classroomsService.checkClassroomAvailability(availabilityDto);
  }

  @Get("building/:buildingNumber")
  @ApiOperation({ summary: "Get classrooms by building number" })
  @ApiParam({
    name: "buildingNumber",
    type: Number,
    description: "Building number",
  })
  @ApiResponse({ status: 200, description: "Return classrooms in building" })
  @ApiResponse({ status: 400, description: "Invalid building number" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findByBuilding(
    @Param("buildingNumber", ParseIntPipe) buildingNumber: number
  ) {
    return this.classroomsService.findByBuilding(buildingNumber);
  }

  @Get("type/:type")
  @ApiOperation({ summary: "Get classrooms by type" })
  @ApiParam({ name: "type", type: String, description: "Classroom type" })
  @ApiResponse({
    status: 200,
    description: "Return classrooms of specified type",
  })
  @ApiResponse({ status: 400, description: "Invalid classroom type" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findByType(@Param("type") type: string) {
    return this.classroomsService.findByType(type);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get classroom by ID" })
  @ApiParam({ name: "id", type: Number, description: "Classroom ID" })
  @ApiResponse({ status: 200, description: "Return classroom" })
  @ApiResponse({ status: 400, description: "Invalid classroom ID" })
  @ApiResponse({ status: 404, description: "Classroom not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findOne(@Param("id", ParseIntPipe) id: number) {
    return this.classroomsService.findOne(id);
  }

  @Get(":id/with-schedules")
  @ApiOperation({ summary: "Get classroom with schedules" })
  @ApiParam({ name: "id", type: Number, description: "Classroom ID" })
  @ApiResponse({ status: 200, description: "Return classroom with schedules" })
  @ApiResponse({ status: 400, description: "Invalid classroom ID" })
  @ApiResponse({ status: 404, description: "Classroom not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getClassroomWithSchedules(@Param("id", ParseIntPipe) id: number) {
    return this.classroomsService.getClassroomWithSchedules(id);
  }

  @Get(":id/weekly-schedule")
  @ApiOperation({ summary: "Get classroom weekly schedule" })
  @ApiParam({ name: "id", type: Number, description: "Classroom ID" })
  @ApiResponse({ status: 200, description: "Return classroom weekly schedule" })
  @ApiResponse({ status: 400, description: "Invalid classroom ID" })
  @ApiResponse({ status: 404, description: "Classroom not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getWeeklySchedule(@Param("id", ParseIntPipe) id: number) {
    return this.classroomsService.getWeeklySchedule(id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Update classroom" })
  @ApiParam({ name: "id", type: Number, description: "Classroom ID" })
  @ApiResponse({ status: 200, description: "Classroom updated successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 404, description: "Classroom not found" })
  @ApiResponse({
    status: 409,
    description: "Classroom with this building and room number already exists",
  })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateClassroomDto: UpdateClassroomDto
  ) {
    return this.classroomsService.update(id, updateClassroomDto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete classroom" })
  @ApiParam({ name: "id", type: Number, description: "Classroom ID" })
  @ApiResponse({ status: 200, description: "Classroom deleted successfully" })
  @ApiResponse({ status: 400, description: "Invalid classroom ID" })
  @ApiResponse({ status: 404, description: "Classroom not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async remove(@Param("id", ParseIntPipe) id: number) {
    return this.classroomsService.remove(id);
  }

  @Patch(":id/toggle-status")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Toggle classroom active status" })
  @ApiParam({ name: "id", type: Number, description: "Classroom ID" })
  @ApiResponse({ status: 200, description: "Status updated successfully" })
  @ApiResponse({ status: 400, description: "Invalid classroom ID" })
  @ApiResponse({ status: 404, description: "Classroom not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async toggleStatus(@Param("id", ParseIntPipe) id: number) {
    return this.classroomsService.toggleStatus(id);
  }

  @Patch(":id/toggle-availability")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Toggle classroom availability" })
  @ApiParam({ name: "id", type: Number, description: "Classroom ID" })
  @ApiResponse({
    status: 200,
    description: "Availability updated successfully",
  })
  @ApiResponse({ status: 400, description: "Invalid classroom ID" })
  @ApiResponse({ status: 404, description: "Classroom not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async toggleAvailability(@Param("id", ParseIntPipe) id: number) {
    return this.classroomsService.toggleAvailability(id);
  }
}
