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
import { FailedSubjectsService } from "./failed_subjects.service";
import { CreateFailedSubjectDto } from "./dto/create-failed_subject.dto";
import { UpdateFailedSubjectDto } from "./dto/update-failed_subject.dto";
import { FilterFailedSubjectDto } from "./dto/filter-failed-subject.dto";
import { FailedSubjectStatsDto } from "./dto/failed-subject-stats.dto";
import { RetakePlanDto } from "./dto/retake-plan.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AdminGuard } from "../auth/guards/admin.guard";
import { TeacherGuard } from "../auth/guards/teacher.guard";

@ApiTags("failed-subjects")
@ApiBearerAuth("JWT-auth")
@Controller("failed-subjects")
export class FailedSubjectsController {
  constructor(private readonly failedSubjectsService: FailedSubjectsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Create a new failed subject record" })
  @ApiResponse({
    status: 201,
    description: "Failed subject record created successfully",
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({
    status: 404,
    description: "Student, subject or exam attempt not found",
  })
  @ApiResponse({
    status: 409,
    description: "Failed subject record already exists",
  })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async create(@Body() createFailedSubjectDto: CreateFailedSubjectDto) {
    return this.failedSubjectsService.create(createFailedSubjectDto);
  }

  @Post("auto-detect")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({
    summary:
      "Automatically detect and create failed subjects from exam results",
  })
  @ApiResponse({
    status: 201,
    description: "Failed subjects detection completed",
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async autoDetectFailedSubjects(
    @Query("passing_score") passingScore: number = 60,
    @Query("semester") semester?: number
  ) {
    return this.failedSubjectsService.autoDetectFailedSubjects(
      passingScore,
      semester
    );
  }

  @Post("plan-retakes")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Create retake plan for multiple failed subjects" })
  @ApiResponse({ status: 201, description: "Retake plan created successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 404, description: "Student or subjects not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async planRetakes(@Body() retakePlanDto: RetakePlanDto) {
    return this.failedSubjectsService.createRetakePlan(retakePlanDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all failed subjects with filtering" })
  @ApiResponse({ status: 200, description: "Return all failed subjects" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findAll(@Query() filterDto: FilterFailedSubjectDto) {
    return this.failedSubjectsService.findAll(filterDto);
  }

  @Get("stats")
  @ApiOperation({ summary: "Get failed subjects statistics" })
  @ApiResponse({
    status: 200,
    description: "Return failed subjects statistics",
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getStats(@Query() statsDto: FailedSubjectStatsDto) {
    return this.failedSubjectsService.getFailedSubjectStats(statsDto);
  }

  @Get("alerts/urgent-retakes")
  @ApiOperation({ summary: "Get urgent retake alerts" })
  @ApiResponse({ status: 200, description: "Return urgent retake alerts" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getUrgentRetakes(@Query("days_threshold") daysThreshold: number = 7) {
    return this.failedSubjectsService.getUrgentRetakes(daysThreshold);
  }

  @Get("student/:studentId")
  @ApiOperation({ summary: "Get failed subjects by student ID" })
  @ApiParam({ name: "studentId", type: Number, description: "Student ID" })
  @ApiResponse({
    status: 200,
    description: "Return failed subjects for student",
  })
  @ApiResponse({ status: 400, description: "Invalid student ID" })
  @ApiResponse({ status: 404, description: "Student not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findByStudent(@Param("studentId", ParseIntPipe) studentId: number) {
    return this.failedSubjectsService.findByStudent(studentId);
  }

  @Get("student/:studentId/active")
  @ApiOperation({
    summary: "Get active (unresolved) failed subjects for student",
  })
  @ApiParam({ name: "studentId", type: Number, description: "Student ID" })
  @ApiResponse({ status: 200, description: "Return active failed subjects" })
  @ApiResponse({ status: 400, description: "Invalid student ID" })
  @ApiResponse({ status: 404, description: "Student not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findActiveByStudent(
    @Param("studentId", ParseIntPipe) studentId: number
  ) {
    return this.failedSubjectsService.findActiveByStudent(studentId);
  }

  @Get("subject/:subjectId")
  @ApiOperation({ summary: "Get failed subjects by subject ID" })
  @ApiParam({ name: "subjectId", type: Number, description: "Subject ID" })
  @ApiResponse({
    status: 200,
    description: "Return failed subjects for subject",
  })
  @ApiResponse({ status: 400, description: "Invalid subject ID" })
  @ApiResponse({ status: 404, description: "Subject not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findBySubject(@Param("subjectId", ParseIntPipe) subjectId: number) {
    return this.failedSubjectsService.findBySubject(subjectId);
  }

  @Get("group/:groupId")
  @ApiOperation({ summary: "Get failed subjects by group ID" })
  @ApiParam({ name: "groupId", type: Number, description: "Group ID" })
  @ApiResponse({ status: 200, description: "Return failed subjects for group" })
  @ApiResponse({ status: 400, description: "Invalid group ID" })
  @ApiResponse({ status: 404, description: "Group not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findByGroup(@Param("groupId", ParseIntPipe) groupId: number) {
    return this.failedSubjectsService.findByGroup(groupId);
  }

  @Get("academic-risk")
  @ApiOperation({ summary: "Get students at academic risk" })
  @ApiResponse({ status: 200, description: "Return students at academic risk" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getAcademicRiskStudents(
    @Query("min_failed") minFailed: number = 3,
    @Query("semester") semester?: number
  ) {
    return this.failedSubjectsService.getAcademicRiskStudents(
      minFailed,
      semester
    );
  }

  @Get(":id")
  @ApiOperation({ summary: "Get failed subject by ID" })
  @ApiParam({ name: "id", type: Number, description: "Failed Subject ID" })
  @ApiResponse({ status: 200, description: "Return failed subject" })
  @ApiResponse({ status: 400, description: "Invalid failed subject ID" })
  @ApiResponse({ status: 404, description: "Failed subject not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findOne(@Param("id", ParseIntPipe) id: number) {
    return this.failedSubjectsService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Update failed subject" })
  @ApiParam({ name: "id", type: Number, description: "Failed Subject ID" })
  @ApiResponse({
    status: 200,
    description: "Failed subject updated successfully",
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 404, description: "Failed subject not found" })
  @ApiResponse({ status: 409, description: "Failed subject already exists" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateFailedSubjectDto: UpdateFailedSubjectDto
  ) {
    return this.failedSubjectsService.update(id, updateFailedSubjectDto);
  }

  @Patch(":id/mark-resolved")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Mark failed subject as resolved" })
  @ApiParam({ name: "id", type: Number, description: "Failed Subject ID" })
  @ApiResponse({
    status: 200,
    description: "Failed subject marked as resolved",
  })
  @ApiResponse({ status: 400, description: "Invalid failed subject ID" })
  @ApiResponse({ status: 404, description: "Failed subject not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async markAsResolved(
    @Param("id", ParseIntPipe) id: number,
    @Body("resolution_notes") resolutionNotes?: string
  ) {
    return this.failedSubjectsService.markAsResolved(id, resolutionNotes);
  }

  @Patch(":id/schedule-retake")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Schedule retake for failed subject" })
  @ApiParam({ name: "id", type: Number, description: "Failed Subject ID" })
  @ApiResponse({ status: 200, description: "Retake scheduled successfully" })
  @ApiResponse({ status: 400, description: "Invalid failed subject ID" })
  @ApiResponse({ status: 404, description: "Failed subject not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async scheduleRetake(
    @Param("id", ParseIntPipe) id: number,
    @Body("retake_date") retakeDate: string,
    @Body("semester") semester?: number
  ) {
    return this.failedSubjectsService.scheduleRetake(id, retakeDate, semester);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete failed subject" })
  @ApiParam({ name: "id", type: Number, description: "Failed Subject ID" })
  @ApiResponse({
    status: 200,
    description: "Failed subject deleted successfully",
  })
  @ApiResponse({ status: 400, description: "Invalid failed subject ID" })
  @ApiResponse({ status: 404, description: "Failed subject not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async remove(@Param("id", ParseIntPipe) id: number) {
    return this.failedSubjectsService.remove(id);
  }

  @Get("analytics/trends")
  @ApiOperation({ summary: "Get failed subjects trends analytics" })
  @ApiResponse({ status: 200, description: "Return failed subjects trends" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getFailedSubjectsTrends(
    @Query("period") period: string = "monthly",
    @Query("limit") limit: number = 12
  ) {
    return this.failedSubjectsService.getFailedSubjectsTrends(period, limit);
  }

  @Get("reports/summary")
  @ApiOperation({ summary: "Generate failed subjects summary report" })
  @ApiResponse({
    status: 200,
    description: "Return failed subjects summary report",
  })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async generateSummaryReport(
    @Query("academic_year") academicYear?: number,
    @Query("semester") semester?: number,
    @Query("faculty_id") facultyId?: number
  ) {
    return this.failedSubjectsService.generateSummaryReport(
      academicYear,
      semester,
      facultyId
    );
  }
}
