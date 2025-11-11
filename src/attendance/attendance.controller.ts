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
import { AttendanceService } from "./attendance.service";
import { CreateAttendanceDto } from "./dto/create-attendance.dto";
import { UpdateAttendanceDto } from "./dto/update-attendance.dto";
import { FilterAttendanceDto } from "./dto/filter-attendance.dto";
import { BulkAttendanceDto } from "./dto/bulk-attendance.dto";
import { AttendanceStatsDto } from "./dto/attendance-stats.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AdminGuard } from "../auth/guards/admin.guard";
import { TeacherGuard } from "../auth/guards/teacher.guard";

@ApiTags("attendance")
@ApiBearerAuth("JWT-auth")
@Controller("attendance")
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Create a new attendance record" })
  @ApiResponse({
    status: 201,
    description: "Attendance record created successfully",
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 404, description: "Student or schedule not found" })
  @ApiResponse({ status: 409, description: "Attendance record already exists" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async create(@Body() createAttendanceDto: CreateAttendanceDto) {
    return this.attendanceService.create(createAttendanceDto);
  }

  @Post("bulk")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Create multiple attendance records in bulk" })
  @ApiResponse({
    status: 201,
    description: "Bulk attendance records created successfully",
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 404, description: "Schedule not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async createBulk(@Body() bulkAttendanceDto: BulkAttendanceDto) {
    return this.attendanceService.createBulk(bulkAttendanceDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all attendance records with filtering" })
  @ApiResponse({
    status: 200,
    description: "Return all attendance records",
  })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findAll(@Query() filterDto: FilterAttendanceDto) {
    return this.attendanceService.findAll(filterDto);
  }

  @Get("stats")
  @ApiOperation({ summary: "Get attendance statistics" })
  @ApiResponse({
    status: 200,
    description: "Return attendance statistics",
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getStats(@Query() statsDto: AttendanceStatsDto) {
    return this.attendanceService.getAttendanceStats(statsDto);
  }

  @Get("alerts/low-attendance")
  @ApiOperation({ summary: "Get low attendance alerts" })
  @ApiResponse({
    status: 200,
    description: "Return low attendance alerts",
  })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getLowAttendanceAlerts(
    @Query("threshold") threshold: number = 75,
    @Query("days") days: number = 30
  ) {
    return this.attendanceService.getLowAttendanceAlerts(threshold, days);
  }

  @Get("student/:studentId")
  @ApiOperation({ summary: "Get attendance records by student ID" })
  @ApiParam({ name: "studentId", type: Number, description: "Student ID" })
  @ApiResponse({
    status: 200,
    description: "Return attendance records for student",
  })
  @ApiResponse({ status: 400, description: "Invalid student ID" })
  @ApiResponse({ status: 404, description: "Student not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findByStudent(@Param("studentId", ParseIntPipe) studentId: number) {
    return this.attendanceService.findByStudent(studentId);
  }

  @Get("student/:studentId/stats")
  @ApiOperation({ summary: "Get student attendance statistics" })
  @ApiParam({ name: "studentId", type: Number, description: "Student ID" })
  @ApiResponse({
    status: 200,
    description: "Return student attendance statistics",
  })
  @ApiResponse({ status: 400, description: "Invalid student ID" })
  @ApiResponse({ status: 404, description: "Student not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getStudentStats(
    @Param("studentId", ParseIntPipe) studentId: number,
    @Query("start_date") startDate: string,
    @Query("end_date") endDate: string
  ) {
    return this.attendanceService.getStudentAttendanceStats(
      studentId,
      startDate,
      endDate
    );
  }

  @Get("student/:studentId/monthly/:year/:month")
  @ApiOperation({ summary: "Get monthly attendance for student" })
  @ApiParam({ name: "studentId", type: Number, description: "Student ID" })
  @ApiParam({ name: "year", type: Number, description: "Year" })
  @ApiParam({ name: "month", type: Number, description: "Month (1-12)" })
  @ApiResponse({
    status: 200,
    description: "Return monthly attendance for student",
  })
  @ApiResponse({ status: 400, description: "Invalid parameters" })
  @ApiResponse({ status: 404, description: "Student not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getMonthlyAttendance(
    @Param("studentId", ParseIntPipe) studentId: number,
    @Param("year", ParseIntPipe) year: number,
    @Param("month", ParseIntPipe) month: number
  ) {
    return this.attendanceService.getMonthlyAttendance(studentId, year, month);
  }

  @Get("schedule/:scheduleId")
  @ApiOperation({ summary: "Get attendance records by schedule ID" })
  @ApiParam({ name: "scheduleId", type: Number, description: "Schedule ID" })
  @ApiResponse({
    status: 200,
    description: "Return attendance records for schedule",
  })
  @ApiResponse({ status: 400, description: "Invalid schedule ID" })
  @ApiResponse({ status: 404, description: "Schedule not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findBySchedule(
    @Param("scheduleId", ParseIntPipe) scheduleId: number,
    @Query("date") date?: string
  ) {
    return this.attendanceService.findBySchedule(scheduleId, date);
  }

  @Get("group/:groupId/stats")
  @ApiOperation({ summary: "Get group attendance statistics" })
  @ApiParam({ name: "groupId", type: Number, description: "Group ID" })
  @ApiResponse({
    status: 200,
    description: "Return group attendance statistics",
  })
  @ApiResponse({ status: 400, description: "Invalid group ID" })
  @ApiResponse({ status: 404, description: "Group not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getGroupStats(
    @Param("groupId", ParseIntPipe) groupId: number,
    @Query("start_date") startDate: string,
    @Query("end_date") endDate: string
  ) {
    return this.attendanceService.getGroupAttendanceStats(
      groupId,
      startDate,
      endDate
    );
  }

  @Get(":id")
  @ApiOperation({ summary: "Get attendance record by ID" })
  @ApiParam({ name: "id", type: Number, description: "Attendance ID" })
  @ApiResponse({ status: 200, description: "Return attendance record" })
  @ApiResponse({ status: 400, description: "Invalid attendance ID" })
  @ApiResponse({ status: 404, description: "Attendance record not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findOne(@Param("id", ParseIntPipe) id: number) {
    return this.attendanceService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Update attendance record" })
  @ApiParam({ name: "id", type: Number, description: "Attendance ID" })
  @ApiResponse({
    status: 200,
    description: "Attendance record updated successfully",
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 404, description: "Attendance record not found" })
  @ApiResponse({ status: 409, description: "Attendance record already exists" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateAttendanceDto: UpdateAttendanceDto
  ) {
    return this.attendanceService.update(id, updateAttendanceDto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete attendance record" })
  @ApiParam({ name: "id", type: Number, description: "Attendance ID" })
  @ApiResponse({
    status: 200,
    description: "Attendance record deleted successfully",
  })
  @ApiResponse({ status: 400, description: "Invalid attendance ID" })
  @ApiResponse({ status: 404, description: "Attendance record not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async remove(@Param("id", ParseIntPipe) id: number) {
    return this.attendanceService.remove(id);
  }

  @Patch(":id/toggle-status")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Toggle attendance record active status" })
  @ApiParam({ name: "id", type: Number, description: "Attendance ID" })
  @ApiResponse({ status: 200, description: "Status updated successfully" })
  @ApiResponse({ status: 400, description: "Invalid attendance ID" })
  @ApiResponse({ status: 404, description: "Attendance record not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async toggleStatus(@Param("id", ParseIntPipe) id: number) {
    return this.attendanceService.toggleStatus(id);
  }


  @Get("student/:studentId/heatmap")
  @ApiOperation({ summary: "Get attendance heatmap for student" })
  @ApiParam({ name: "studentId", type: Number, description: "Student ID" })
  @ApiResponse({
    status: 200,
    description: "Return attendance heatmap",
  })
  @ApiResponse({ status: 400, description: "Invalid student ID" })
  @ApiResponse({ status: 404, description: "Student not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getAttendanceHeatmap(
    @Param("studentId", ParseIntPipe) studentId: number,
    @Query("start_date") startDate: string,
    @Query("end_date") endDate: string
  ) {
    return this.attendanceService.getAttendanceHeatmap(
      studentId,
      startDate,
      endDate
    );
  }

  @Get("student/:studentId/subject-wise")
  @ApiOperation({ summary: "Get subject-wise attendance for student" })
  @ApiParam({ name: "studentId", type: Number, description: "Student ID" })
  @ApiResponse({
    status: 200,
    description: "Return subject-wise attendance",
  })
  @ApiResponse({ status: 400, description: "Invalid student ID" })
  @ApiResponse({ status: 404, description: "Student not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getSubjectWiseAttendance(
    @Param("studentId", ParseIntPipe) studentId: number,
    @Query("start_date") startDate: string,
    @Query("end_date") endDate: string
  ) {
    return this.attendanceService.getSubjectWiseAttendance(
      studentId,
      startDate,
      endDate
    );
  }

  @Get("schedule/:scheduleId/summary")
  @ApiOperation({ summary: "Get class attendance summary" })
  @ApiParam({ name: "scheduleId", type: Number, description: "Schedule ID" })
  @ApiResponse({
    status: 200,
    description: "Return class attendance summary",
  })
  @ApiResponse({ status: 400, description: "Invalid schedule ID" })
  @ApiResponse({ status: 404, description: "Schedule not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getClassAttendanceSummary(
    @Param("scheduleId", ParseIntPipe) scheduleId: number,
    @Query("date") date: string
  ) {
    return this.attendanceService.getClassAttendanceSummary(scheduleId, date);
  }

  @Get("group/:groupId/report")
  @ApiOperation({ summary: "Generate attendance report for group" })
  @ApiParam({ name: "groupId", type: Number, description: "Group ID" })
  @ApiResponse({
    status: 200,
    description: "Return attendance report",
  })
  @ApiResponse({ status: 400, description: "Invalid group ID" })
  @ApiResponse({ status: 404, description: "Group not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async generateAttendanceReport(
    @Param("groupId", ParseIntPipe) groupId: number,
    @Query("start_date") startDate: string,
    @Query("end_date") endDate: string
  ) {
    return this.attendanceService.generateAttendanceReport(
      groupId,
      startDate,
      endDate
    );
  }
}
