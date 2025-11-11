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
import { ExamsService } from "./exams.service";
import { CreateExamDto } from "./dto/create-exam.dto";
import { UpdateExamDto } from "./dto/update-exam.dto";
import { FilterExamDto } from "./dto/filter-exam.dto";
import { ExamScheduleDto } from "./dto/exam-schedule.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AdminGuard } from "../auth/guards/admin.guard";
import { TeacherGuard } from "../auth/guards/teacher.guard";

@ApiTags("exams")
@ApiBearerAuth("JWT-auth")
@Controller("exams")
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Create a new exam" })
  @ApiResponse({ status: 201, description: "Exam created successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 404, description: "Related entity not found" })
  @ApiResponse({ status: 409, description: "Exam already exists" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async create(@Body() createExamDto: CreateExamDto) {
    return this.examsService.create(createExamDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all exams with filtering" })
  @ApiResponse({ status: 200, description: "Return all exams" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findAll(@Query() filterDto: FilterExamDto) {
    return this.examsService.findAll(filterDto);
  }

  @Get("stats")
  @ApiOperation({ summary: "Get exams statistics" })
  @ApiResponse({ status: 200, description: "Return exams statistics" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getStats() {
    return this.examsService.getExamStats();
  }

  @Get("schedule")
  @ApiOperation({ summary: "Get exam schedule" })
  @ApiResponse({ status: 200, description: "Return exam schedule" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getExamSchedule(@Query() scheduleDto: ExamScheduleDto) {
    return this.examsService.getExamSchedule(scheduleDto);
  }

  @Get("upcoming")
  @ApiOperation({ summary: "Get upcoming exams" })
  @ApiResponse({ status: 200, description: "Return upcoming exams" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getUpcomingExams(@Query("days") days: number = 30) {
    return this.examsService.getUpcomingExams(days);
  }

  @Get("conflicts")
  @ApiOperation({ summary: "Check for exam conflicts" })
  @ApiResponse({ status: 200, description: "Return conflict check results" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getExamConflicts(
    @Query("teacher_id") teacherId: number,
    @Query("exam_date") examDate: string,
    @Query("start_time") startTime?: string,
    @Query("end_time") endTime?: string
  ) {
    return this.examsService.getExamConflicts(
      teacherId,
      examDate,
      startTime,
      endTime
    );
  }

  @Get("group/:groupId")
  @ApiOperation({ summary: "Get exams by group ID" })
  @ApiParam({ name: "groupId", type: Number, description: "Group ID" })
  @ApiResponse({ status: 200, description: "Return exams for group" })
  @ApiResponse({ status: 400, description: "Invalid group ID" })
  @ApiResponse({ status: 404, description: "Group not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findByGroup(@Param("groupId", ParseIntPipe) groupId: number) {
    return this.examsService.findByGroup(groupId);
  }

  @Get("teacher/:teacherId")
  @ApiOperation({ summary: "Get exams by teacher ID" })
  @ApiParam({ name: "teacherId", type: Number, description: "Teacher ID" })
  @ApiResponse({ status: 200, description: "Return exams for teacher" })
  @ApiResponse({ status: 400, description: "Invalid teacher ID" })
  @ApiResponse({ status: 404, description: "Teacher not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findByTeacher(@Param("teacherId", ParseIntPipe) teacherId: number) {
    return this.examsService.findByTeacher(teacherId);
  }

  @Get("teacher/:teacherId/workload")
  @ApiOperation({ summary: "Get teacher exam workload" })
  @ApiParam({ name: "teacherId", type: Number, description: "Teacher ID" })
  @ApiResponse({ status: 200, description: "Return teacher exam workload" })
  @ApiResponse({ status: 400, description: "Invalid teacher ID" })
  @ApiResponse({ status: 404, description: "Teacher not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getTeacherWorkload(
    @Param("teacherId", ParseIntPipe) teacherId: number,
    @Query("start_date") startDate: string,
    @Query("end_date") endDate: string
  ) {
    return this.examsService.getTeacherExamWorkload(
      teacherId,
      startDate,
      endDate
    );
  }

  @Get("subject/:subjectId")
  @ApiOperation({ summary: "Get exams by subject ID" })
  @ApiParam({ name: "subjectId", type: Number, description: "Subject ID" })
  @ApiResponse({ status: 200, description: "Return exams for subject" })
  @ApiResponse({ status: 400, description: "Invalid subject ID" })
  @ApiResponse({ status: 404, description: "Subject not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findBySubject(@Param("subjectId", ParseIntPipe) subjectId: number) {
    return this.examsService.findBySubject(subjectId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get exam by ID" })
  @ApiParam({ name: "id", type: Number, description: "Exam ID" })
  @ApiResponse({ status: 200, description: "Return exam" })
  @ApiResponse({ status: 400, description: "Invalid exam ID" })
  @ApiResponse({ status: 404, description: "Exam not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findOne(@Param("id", ParseIntPipe) id: number) {
    return this.examsService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Update exam" })
  @ApiParam({ name: "id", type: Number, description: "Exam ID" })
  @ApiResponse({ status: 200, description: "Exam updated successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 404, description: "Exam not found" })
  @ApiResponse({ status: 409, description: "Exam already exists" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateExamDto: UpdateExamDto
  ) {
    return this.examsService.update(id, updateExamDto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete exam" })
  @ApiParam({ name: "id", type: Number, description: "Exam ID" })
  @ApiResponse({ status: 200, description: "Exam deleted successfully" })
  @ApiResponse({ status: 400, description: "Invalid exam ID" })
  @ApiResponse({ status: 404, description: "Exam not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async remove(@Param("id", ParseIntPipe) id: number) {
    return this.examsService.remove(id);
  }

  @Patch(":id/toggle-status")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Toggle exam active status" })
  @ApiParam({ name: "id", type: Number, description: "Exam ID" })
  @ApiResponse({ status: 200, description: "Status updated successfully" })
  @ApiResponse({ status: 400, description: "Invalid exam ID" })
  @ApiResponse({ status: 404, description: "Exam not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async toggleStatus(@Param("id", ParseIntPipe) id: number) {
    return this.examsService.toggleStatus(id);
  }
}
