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
import { SchedulesService } from "./schedules.service";
import { CreateScheduleDto } from "./dto/create-schedule.dto";
import { UpdateScheduleDto } from "./dto/update-schedule.dto";
import { FilterScheduleDto } from "./dto/filter-schedule.dto";
import { ScheduleConflictDto } from "./dto/schedule-conflict.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AdminGuard } from "../auth/guards/admin.guard";

@ApiTags("schedules")
@ApiBearerAuth("JWT-auth")
@Controller("schedules")
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Create a new schedule" })
  @ApiResponse({ status: 201, description: "Schedule created successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 404, description: "Related entity not found" })
  @ApiResponse({ status: 409, description: "Schedule conflict detected" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async create(@Body() createScheduleDto: CreateScheduleDto) {
    return this.schedulesService.create(createScheduleDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all schedules with filtering" })
  @ApiResponse({ status: 200, description: "Return all schedules" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findAll(@Query() filterDto: FilterScheduleDto) {
    return this.schedulesService.findAll(filterDto);
  }

  @Get("stats")
  @ApiOperation({ summary: "Get schedules statistics" })
  @ApiResponse({ status: 200, description: "Return schedules statistics" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getStats() {
    return this.schedulesService.getScheduleStats();
  }

  @Post("check-conflicts")
  @ApiOperation({ summary: "Check for schedule conflicts" })
  @ApiResponse({ status: 200, description: "Return conflict check results" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async checkConflicts(@Body() conflictDto: ScheduleConflictDto) {
    return this.schedulesService.checkScheduleConflicts(conflictDto);
  }

  @Get("weekly")
  @ApiOperation({ summary: "Get weekly schedule" })
  @ApiResponse({ status: 200, description: "Return weekly schedule" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getWeeklySchedule(
    @Query("group_id") groupId?: number,
    @Query("teacher_id") teacherId?: number
  ) {
    return this.schedulesService.getWeeklySchedule(groupId, teacherId);
  }

  @Get("group/:groupId")
  @ApiOperation({ summary: "Get schedules by group ID" })
  @ApiParam({ name: "groupId", type: Number, description: "Group ID" })
  @ApiResponse({ status: 200, description: "Return schedules for group" })
  @ApiResponse({ status: 400, description: "Invalid group ID" })
  @ApiResponse({ status: 404, description: "Group not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findByGroup(@Param("groupId", ParseIntPipe) groupId: number) {
    return this.schedulesService.findByGroup(groupId);
  }

  @Get("teacher/:teacherId")
  @ApiOperation({ summary: "Get schedules by teacher ID" })
  @ApiParam({ name: "teacherId", type: Number, description: "Teacher ID" })
  @ApiResponse({ status: 200, description: "Return schedules for teacher" })
  @ApiResponse({ status: 400, description: "Invalid teacher ID" })
  @ApiResponse({ status: 404, description: "Teacher not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findByTeacher(@Param("teacherId", ParseIntPipe) teacherId: number) {
    return this.schedulesService.findByTeacher(teacherId);
  }

  @Get("classroom/:classroomId")
  @ApiOperation({ summary: "Get schedules by classroom ID" })
  @ApiParam({ name: "classroomId", type: Number, description: "Classroom ID" })
  @ApiResponse({ status: 200, description: "Return schedules for classroom" })
  @ApiResponse({ status: 400, description: "Invalid classroom ID" })
  @ApiResponse({ status: 404, description: "Classroom not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findByClassroom(
    @Param("classroomId", ParseIntPipe) classroomId: number
  ) {
    return this.schedulesService.findByClassroom(classroomId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get schedule by ID" })
  @ApiParam({ name: "id", type: Number, description: "Schedule ID" })
  @ApiResponse({ status: 200, description: "Return schedule" })
  @ApiResponse({ status: 400, description: "Invalid schedule ID" })
  @ApiResponse({ status: 404, description: "Schedule not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findOne(@Param("id", ParseIntPipe) id: number) {
    return this.schedulesService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Update schedule" })
  @ApiParam({ name: "id", type: Number, description: "Schedule ID" })
  @ApiResponse({ status: 200, description: "Schedule updated successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 404, description: "Schedule not found" })
  @ApiResponse({ status: 409, description: "Schedule conflict detected" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateScheduleDto: UpdateScheduleDto
  ) {
    return this.schedulesService.update(id, updateScheduleDto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete schedule" })
  @ApiParam({ name: "id", type: Number, description: "Schedule ID" })
  @ApiResponse({ status: 200, description: "Schedule deleted successfully" })
  @ApiResponse({ status: 400, description: "Invalid schedule ID" })
  @ApiResponse({ status: 404, description: "Schedule not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async remove(@Param("id", ParseIntPipe) id: number) {
    return this.schedulesService.remove(id);
  }

  @Patch(":id/toggle-status")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Toggle schedule active status" })
  @ApiParam({ name: "id", type: Number, description: "Schedule ID" })
  @ApiResponse({ status: 200, description: "Status updated successfully" })
  @ApiResponse({ status: 400, description: "Invalid schedule ID" })
  @ApiResponse({ status: 404, description: "Schedule not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async toggleStatus(@Param("id", ParseIntPipe) id: number) {
    return this.schedulesService.toggleStatus(id);
  }

  // schedules.controller.ts ga qo'shimcha endpointlar

  @Get("available-slots/:classroomId/:dayOfWeek")
  @ApiOperation({ summary: "Get available time slots for classroom" })
  @ApiParam({ name: "classroomId", type: Number, description: "Classroom ID" })
  @ApiParam({
    name: "dayOfWeek",
    type: Number,
    description: "Day of week (1-7)",
  })
  @ApiResponse({ status: 200, description: "Return available time slots" })
  @ApiResponse({ status: 400, description: "Invalid parameters" })
  @ApiResponse({ status: 404, description: "Classroom not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getAvailableSlots(
    @Param("classroomId", ParseIntPipe) classroomId: number,
    @Param("dayOfWeek", ParseIntPipe) dayOfWeek: number,
    @Query("date") date?: string
  ) {
    return this.schedulesService.getAvailableTimeSlots(
      classroomId,
      dayOfWeek,
      date
    );
  }

  @Get("teacher/:teacherId/workload")
  @ApiOperation({ summary: "Get teacher workload" })
  @ApiParam({ name: "teacherId", type: Number, description: "Teacher ID" })
  @ApiResponse({ status: 200, description: "Return teacher workload" })
  @ApiResponse({ status: 400, description: "Invalid teacher ID" })
  @ApiResponse({ status: 404, description: "Teacher not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getTeacherWorkload(
    @Param("teacherId", ParseIntPipe) teacherId: number,
    @Query("week_start") weekStart?: string
  ) {
    return this.schedulesService.getTeacherWorkload(teacherId, weekStart);
  }

  @Get("group/:groupId/timetable")
  @ApiOperation({ summary: "Generate group timetable" })
  @ApiParam({ name: "groupId", type: Number, description: "Group ID" })
  @ApiResponse({ status: 200, description: "Return group timetable" })
  @ApiResponse({ status: 400, description: "Invalid group ID" })
  @ApiResponse({ status: 404, description: "Group not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async generateTimetable(
    @Param("groupId", ParseIntPipe) groupId: number,
    @Query("semester") semester?: number
  ) {
    return this.schedulesService.generateTimetable(groupId, semester);
  }

  @Get("conflicts/detect")
  @ApiOperation({ summary: "Detect conflicting schedules" })
  @ApiResponse({ status: 200, description: "Return conflicting schedules" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findConflictingSchedules(
    @Query("classroom_id") classroomId?: number,
    @Query("teacher_id") teacherId?: number,
    @Query("group_id") groupId?: number,
    @Query("day_of_week") dayOfWeek?: number
  ) {
    return this.schedulesService.findConflictingSchedules(
      classroomId,
      teacherId,
      groupId,
      dayOfWeek
    );
  }
}
