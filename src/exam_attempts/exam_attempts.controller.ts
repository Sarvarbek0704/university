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
import { FilterExamAttemptDto } from "./dto/filter-exam-attempt.dto";
import { ExamAttemptStatsDto } from "./dto/exam-attempt-stats.dto";
import { RetakeRequestDto } from "./dto/retake-request.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AdminGuard } from "../auth/guards/admin.guard";
import { TeacherGuard } from "../auth/guards/teacher.guard";
import { ExamAttemptsService } from "./exam_attempts.service";
import { CreateExamAttemptDto } from "./dto/create-exam_attempt.dto";
import { UpdateExamAttemptDto } from "./dto/update-exam_attempt.dto";

@ApiTags("exam-attempts")
@ApiBearerAuth("JWT-auth")
@Controller("exam-attempts")
export class ExamAttemptsController {
  constructor(private readonly examAttemptsService: ExamAttemptsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Create a new exam attempt" })
  @ApiResponse({
    status: 201,
    description: "Exam attempt created successfully",
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 404, description: "Exam or student not found" })
  @ApiResponse({ status: 409, description: "Exam attempt already exists" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async create(@Body() createExamAttemptDto: CreateExamAttemptDto) {
    return this.examAttemptsService.create(createExamAttemptDto);
  }

  @Post("request-retake")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Request exam retake" })
  @ApiResponse({
    status: 201,
    description: "Retake request submitted successfully",
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 404, description: "Exam or student not found" })
  @ApiResponse({ status: 409, description: "Cannot request retake" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async requestRetake(@Body() retakeRequestDto: RetakeRequestDto) {
    return this.examAttemptsService.requestRetake(retakeRequestDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all exam attempts with filtering" })
  @ApiResponse({ status: 200, description: "Return all exam attempts" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findAll(@Query() filterDto: FilterExamAttemptDto) {
    return this.examAttemptsService.findAll(filterDto);
  }

  @Get("stats")
  @ApiOperation({ summary: "Get exam attempts statistics" })
  @ApiResponse({ status: 200, description: "Return exam attempts statistics" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getStats(@Query() statsDto: ExamAttemptStatsDto) {
    return this.examAttemptsService.getExamAttemptStats(statsDto);
  }

  @Get("student/:studentId")
  @ApiOperation({ summary: "Get exam attempts by student ID" })
  @ApiParam({ name: "studentId", type: Number, description: "Student ID" })
  @ApiResponse({ status: 200, description: "Return exam attempts for student" })
  @ApiResponse({ status: 400, description: "Invalid student ID" })
  @ApiResponse({ status: 404, description: "Student not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findByStudent(@Param("studentId", ParseIntPipe) studentId: number) {
    return this.examAttemptsService.findByStudent(studentId);
  }

  @Get("student/:studentId/exam/:examId")
  @ApiOperation({ summary: "Get student attempts for specific exam" })
  @ApiParam({ name: "studentId", type: Number, description: "Student ID" })
  @ApiParam({ name: "examId", type: Number, description: "Exam ID" })
  @ApiResponse({ status: 200, description: "Return student exam attempts" })
  @ApiResponse({ status: 400, description: "Invalid parameters" })
  @ApiResponse({ status: 404, description: "Student or exam not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getStudentExamAttempts(
    @Param("studentId", ParseIntPipe) studentId: number,
    @Param("examId", ParseIntPipe) examId: number
  ) {
    return this.examAttemptsService.getStudentExamAttempts(studentId, examId);
  }

  @Get("exam/:examId")
  @ApiOperation({ summary: "Get exam attempts by exam ID" })
  @ApiParam({ name: "examId", type: Number, description: "Exam ID" })
  @ApiResponse({ status: 200, description: "Return exam attempts for exam" })
  @ApiResponse({ status: 400, description: "Invalid exam ID" })
  @ApiResponse({ status: 404, description: "Exam not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findByExam(@Param("examId", ParseIntPipe) examId: number) {
    return this.examAttemptsService.findByExam(examId);
  }

  @Get("exam/:examId/retakes")
  @ApiOperation({ summary: "Get retake attempts for exam" })
  @ApiParam({ name: "examId", type: Number, description: "Exam ID" })
  @ApiResponse({ status: 200, description: "Return retake attempts" })
  @ApiResponse({ status: 400, description: "Invalid exam ID" })
  @ApiResponse({ status: 404, description: "Exam not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getExamRetakes(@Param("examId", ParseIntPipe) examId: number) {
    return this.examAttemptsService.getExamRetakes(examId);
  }

  @Get("pending-retakes")
  @ApiOperation({ summary: "Get pending retake requests" })
  @ApiResponse({ status: 200, description: "Return pending retake requests" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getPendingRetakes() {
    return this.examAttemptsService.getPendingRetakes();
  }

  @Get("student/:studentId/improvement")
  @ApiOperation({ summary: "Get student improvement across attempts" })
  @ApiParam({ name: "studentId", type: Number, description: "Student ID" })
  @ApiResponse({ status: 200, description: "Return student improvement data" })
  @ApiResponse({ status: 400, description: "Invalid student ID" })
  @ApiResponse({ status: 404, description: "Student not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getStudentImprovement(
    @Param("studentId", ParseIntPipe) studentId: number
  ) {
    return this.examAttemptsService.getStudentImprovement(studentId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get exam attempt by ID" })
  @ApiParam({ name: "id", type: Number, description: "Exam Attempt ID" })
  @ApiResponse({ status: 200, description: "Return exam attempt" })
  @ApiResponse({ status: 400, description: "Invalid exam attempt ID" })
  @ApiResponse({ status: 404, description: "Exam attempt not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findOne(@Param("id", ParseIntPipe) id: number) {
    return this.examAttemptsService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Update exam attempt" })
  @ApiParam({ name: "id", type: Number, description: "Exam Attempt ID" })
  @ApiResponse({
    status: 200,
    description: "Exam attempt updated successfully",
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 404, description: "Exam attempt not found" })
  @ApiResponse({ status: 409, description: "Exam attempt already exists" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateExamAttemptDto: UpdateExamAttemptDto
  ) {
    return this.examAttemptsService.update(id, updateExamAttemptDto);
  }

  @Patch(":id/pay-fee")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Mark retake fee as paid" })
  @ApiParam({ name: "id", type: Number, description: "Exam Attempt ID" })
  @ApiResponse({ status: 200, description: "Fee marked as paid successfully" })
  @ApiResponse({ status: 400, description: "Invalid exam attempt ID" })
  @ApiResponse({ status: 404, description: "Exam attempt not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async payRetakeFee(@Param("id", ParseIntPipe) id: number) {
    return this.examAttemptsService.payRetakeFee(id);
  }

  @Patch(":id/approve-retake")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Approve retake request" })
  @ApiParam({ name: "id", type: Number, description: "Exam Attempt ID" })
  @ApiResponse({ status: 200, description: "Retake approved successfully" })
  @ApiResponse({ status: 400, description: "Invalid exam attempt ID" })
  @ApiResponse({ status: 404, description: "Exam attempt not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async approveRetake(@Param("id", ParseIntPipe) id: number) {
    return this.examAttemptsService.approveRetake(id);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete exam attempt" })
  @ApiParam({ name: "id", type: Number, description: "Exam Attempt ID" })
  @ApiResponse({
    status: 200,
    description: "Exam attempt deleted successfully",
  })
  @ApiResponse({ status: 400, description: "Invalid exam attempt ID" })
  @ApiResponse({ status: 404, description: "Exam attempt not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async remove(@Param("id", ParseIntPipe) id: number) {
    return this.examAttemptsService.remove(id);
  }

  @Get("student/:studentId/failed-exams")
  @ApiOperation({ summary: "Get student's failed exams requiring retakes" })
  @ApiParam({ name: "studentId", type: Number, description: "Student ID" })
  @ApiResponse({ status: 200, description: "Return failed exams" })
  @ApiResponse({ status: 400, description: "Invalid student ID" })
  @ApiResponse({ status: 404, description: "Student not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getFailedExams(@Param("studentId", ParseIntPipe) studentId: number) {
    return this.examAttemptsService.getFailedExams(studentId);
  }

  @Get("analytics/retake-rates")
  @ApiOperation({ summary: "Get retake rates analytics" })
  @ApiResponse({ status: 200, description: "Return retake rates analytics" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getRetakeRatesAnalytics(
    @Query("subject_id") subjectId?: number,
    @Query("group_id") groupId?: number,
    @Query("start_date") startDate?: string,
    @Query("end_date") endDate?: string
  ) {
    return this.examAttemptsService.getRetakeRatesAnalytics(
      subjectId,
      groupId,
      startDate,
      endDate
    );
  }
}
