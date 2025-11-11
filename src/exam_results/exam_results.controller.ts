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
import { FilterExamResultDto } from "./dto/filter-exam-result.dto";
import { ExamResultStatsDto } from "./dto/exam-result-stats.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AdminGuard } from "../auth/guards/admin.guard";
import { TeacherGuard } from "../auth/guards/teacher.guard";
import { CreateExamResultDto } from "./dto/create-exam_result.dto";
import { ExamResultsService } from "./exam_results.service";
import { UpdateExamResultDto } from "./dto/update-exam_result.dto";

@ApiTags("exam-results")
@ApiBearerAuth("JWT-auth")
@Controller("exam-results")
export class ExamResultsController {
  constructor(private readonly examResultsService: ExamResultsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Create a new exam result" })
  @ApiResponse({ status: 201, description: "Exam result created successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 404, description: "Exam or student not found" })
  @ApiResponse({ status: 409, description: "Exam result already exists" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async create(@Body() createExamResultDto: CreateExamResultDto) {
    return this.examResultsService.create(createExamResultDto);
  }

  @Post("bulk")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Create multiple exam results in bulk" })
  @ApiResponse({
    status: 201,
    description: "Bulk exam results created successfully",
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 404, description: "Exam not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async createBulk(@Body() bulkResults: CreateExamResultDto[]) {
    return this.examResultsService.createBulk(bulkResults);
  }

  @Get()
  @ApiOperation({ summary: "Get all exam results with filtering" })
  @ApiResponse({ status: 200, description: "Return all exam results" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findAll(@Query() filterDto: FilterExamResultDto) {
    return this.examResultsService.findAll(filterDto);
  }

  @Get("stats")
  @ApiOperation({ summary: "Get exam results statistics" })
  @ApiResponse({ status: 200, description: "Return exam results statistics" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getStats(@Query() statsDto: ExamResultStatsDto) {
    return this.examResultsService.getExamResultStats(statsDto);
  }

  @Get("student/:studentId")
  @ApiOperation({ summary: "Get exam results by student ID" })
  @ApiParam({ name: "studentId", type: Number, description: "Student ID" })
  @ApiResponse({ status: 200, description: "Return exam results for student" })
  @ApiResponse({ status: 400, description: "Invalid student ID" })
  @ApiResponse({ status: 404, description: "Student not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findByStudent(@Param("studentId", ParseIntPipe) studentId: number) {
    return this.examResultsService.findByStudent(studentId);
  }

  @Get("student/:studentId/gpa")
  @ApiOperation({ summary: "Calculate student GPA" })
  @ApiParam({ name: "studentId", type: Number, description: "Student ID" })
  @ApiResponse({ status: 200, description: "Return student GPA" })
  @ApiResponse({ status: 400, description: "Invalid student ID" })
  @ApiResponse({ status: 404, description: "Student not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getStudentGPA(@Param("studentId", ParseIntPipe) studentId: number) {
    return this.examResultsService.calculateStudentGPA(studentId);
  }

  @Get("exam/:examId")
  @ApiOperation({ summary: "Get exam results by exam ID" })
  @ApiParam({ name: "examId", type: Number, description: "Exam ID" })
  @ApiResponse({ status: 200, description: "Return exam results for exam" })
  @ApiResponse({ status: 400, description: "Invalid exam ID" })
  @ApiResponse({ status: 404, description: "Exam not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findByExam(@Param("examId", ParseIntPipe) examId: number) {
    return this.examResultsService.findByExam(examId);
  }

  @Get("exam/:examId/statistics")
  @ApiOperation({ summary: "Get detailed statistics for exam" })
  @ApiParam({ name: "examId", type: Number, description: "Exam ID" })
  @ApiResponse({ status: 200, description: "Return exam statistics" })
  @ApiResponse({ status: 400, description: "Invalid exam ID" })
  @ApiResponse({ status: 404, description: "Exam not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getExamStatistics(@Param("examId", ParseIntPipe) examId: number) {
    return this.examResultsService.getExamStatistics(examId);
  }

  @Get("group/:groupId")
  @ApiOperation({ summary: "Get exam results by group ID" })
  @ApiParam({ name: "groupId", type: Number, description: "Group ID" })
  @ApiResponse({ status: 200, description: "Return exam results for group" })
  @ApiResponse({ status: 400, description: "Invalid group ID" })
  @ApiResponse({ status: 404, description: "Group not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findByGroup(@Param("groupId", ParseIntPipe) groupId: number) {
    return this.examResultsService.findByGroup(groupId);
  }

  @Get("subject/:subjectId/top-students")
  @ApiOperation({ summary: "Get top students by subject" })
  @ApiParam({ name: "subjectId", type: Number, description: "Subject ID" })
  @ApiResponse({ status: 200, description: "Return top students for subject" })
  @ApiResponse({ status: 400, description: "Invalid subject ID" })
  @ApiResponse({ status: 404, description: "Subject not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getTopStudentsBySubject(
    @Param("subjectId", ParseIntPipe) subjectId: number,
    @Query("limit") limit: number = 10
  ) {
    return this.examResultsService.getTopStudentsBySubject(subjectId, limit);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get exam result by ID" })
  @ApiParam({ name: "id", type: Number, description: "Exam Result ID" })
  @ApiResponse({ status: 200, description: "Return exam result" })
  @ApiResponse({ status: 400, description: "Invalid exam result ID" })
  @ApiResponse({ status: 404, description: "Exam result not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findOne(@Param("id", ParseIntPipe) id: number) {
    return this.examResultsService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Update exam result" })
  @ApiParam({ name: "id", type: Number, description: "Exam Result ID" })
  @ApiResponse({ status: 200, description: "Exam result updated successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 404, description: "Exam result not found" })
  @ApiResponse({ status: 409, description: "Exam result already exists" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateExamResultDto: UpdateExamResultDto
  ) {
    return this.examResultsService.update(id, updateExamResultDto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete exam result" })
  @ApiParam({ name: "id", type: Number, description: "Exam Result ID" })
  @ApiResponse({ status: 200, description: "Exam result deleted successfully" })
  @ApiResponse({ status: 400, description: "Invalid exam result ID" })
  @ApiResponse({ status: 404, description: "Exam result not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async remove(@Param("id", ParseIntPipe) id: number) {
    return this.examResultsService.remove(id);
  }

  @Patch(":id/publish")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Publish exam result" })
  @ApiParam({ name: "id", type: Number, description: "Exam Result ID" })
  @ApiResponse({
    status: 200,
    description: "Exam result published successfully",
  })
  @ApiResponse({ status: 400, description: "Invalid exam result ID" })
  @ApiResponse({ status: 404, description: "Exam result not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async publish(@Param("id", ParseIntPipe) id: number) {
    return this.examResultsService.publishResult(id);
  }

  @Patch(":id/unpublish")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Unpublish exam result" })
  @ApiParam({ name: "id", type: Number, description: "Exam Result ID" })
  @ApiResponse({
    status: 200,
    description: "Exam result unpublished successfully",
  })
  @ApiResponse({ status: 400, description: "Invalid exam result ID" })
  @ApiResponse({ status: 404, description: "Exam result not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async unpublish(@Param("id", ParseIntPipe) id: number) {
    return this.examResultsService.unpublishResult(id);
  }

  @Get("student/:studentId/subject/:subjectId")
  @ApiOperation({ summary: "Get student results for specific subject" })
  @ApiParam({ name: "studentId", type: Number, description: "Student ID" })
  @ApiParam({ name: "subjectId", type: Number, description: "Subject ID" })
  @ApiResponse({ status: 200, description: "Return student subject results" })
  @ApiResponse({ status: 400, description: "Invalid parameters" })
  @ApiResponse({ status: 404, description: "Student or subject not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getStudentSubjectResults(
    @Param("studentId", ParseIntPipe) studentId: number,
    @Param("subjectId", ParseIntPipe) subjectId: number
  ) {
    return this.examResultsService.getStudentSubjectResults(
      studentId,
      subjectId
    );
  }
}
