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
import { FilterScholarshipTransactionDto } from "./dto/filter-scholarship-transaction.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AdminGuard } from "../auth/guards/admin.guard";
import { ScholarshipTransactionsService } from "./scolarship_transactions.service";
import { CreateScholarshipTransactionDto } from "./dto/create-scolarship_transaction.dto";
import { UpdateScholarshipTransactionDto } from "./dto/update-scolarship_transaction.dto";

@ApiTags("scholarship-transactions")
@ApiBearerAuth("JWT-auth")
@Controller("scholarship-transactions")
export class ScholarshipTransactionsController {
  constructor(
    private readonly scholarshipTransactionsService: ScholarshipTransactionsService
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Create a new scholarship transaction" })
  @ApiResponse({
    status: 201,
    description: "Scholarship transaction created successfully",
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 404, description: "Student or scholarship not found" })
  @ApiResponse({ status: 409, description: "Transaction already exists" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async create(
    @Body() createScholarshipTransactionDto: CreateScholarshipTransactionDto
  ) {
    return this.scholarshipTransactionsService.create(
      createScholarshipTransactionDto
    );
  }

  @Get()
  @ApiOperation({ summary: "Get all scholarship transactions with filtering" })
  @ApiResponse({
    status: 200,
    description: "Return all scholarship transactions",
  })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findAll(@Query() filterDto: FilterScholarshipTransactionDto) {
    return this.scholarshipTransactionsService.findAll(filterDto);
  }

  @Get("stats")
  @ApiOperation({ summary: "Get scholarship transactions statistics" })
  @ApiResponse({
    status: 200,
    description: "Return scholarship transactions statistics",
  })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getStats() {
    return this.scholarshipTransactionsService.getTransactionsStats();
  }

  @Get("student/:studentId")
  @ApiOperation({ summary: "Get transactions by student ID" })
  @ApiParam({ name: "studentId", type: Number, description: "Student ID" })
  @ApiResponse({
    status: 200,
    description: "Return transactions for student",
  })
  @ApiResponse({ status: 400, description: "Invalid student ID" })
  @ApiResponse({ status: 404, description: "Student not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findByStudent(@Param("studentId", ParseIntPipe) studentId: number) {
    return this.scholarshipTransactionsService.findByStudent(studentId);
  }

  @Get("scholarship/:scholarshipId")
  @ApiOperation({ summary: "Get transactions by scholarship ID" })
  @ApiParam({
    name: "scholarshipId",
    type: Number,
    description: "Scholarship ID",
  })
  @ApiResponse({
    status: 200,
    description: "Return transactions for scholarship",
  })
  @ApiResponse({ status: 400, description: "Invalid scholarship ID" })
  @ApiResponse({ status: 404, description: "Scholarship not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findByScholarship(
    @Param("scholarshipId", ParseIntPipe) scholarshipId: number
  ) {
    return this.scholarshipTransactionsService.findByScholarship(scholarshipId);
  }

  @Get("student/:studentId/stats")
  @ApiOperation({ summary: "Get student transactions statistics" })
  @ApiParam({ name: "studentId", type: Number, description: "Student ID" })
  @ApiResponse({
    status: 200,
    description: "Return student transactions statistics",
  })
  @ApiResponse({ status: 400, description: "Invalid student ID" })
  @ApiResponse({ status: 404, description: "Student not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getStudentStats(@Param("studentId", ParseIntPipe) studentId: number) {
    return this.scholarshipTransactionsService.getStudentTransactionsStats(
      studentId
    );
  }

  @Get(":id")
  @ApiOperation({ summary: "Get scholarship transaction by ID" })
  @ApiParam({ name: "id", type: Number, description: "Transaction ID" })
  @ApiResponse({ status: 200, description: "Return transaction" })
  @ApiResponse({ status: 400, description: "Invalid transaction ID" })
  @ApiResponse({ status: 404, description: "Transaction not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findOne(@Param("id", ParseIntPipe) id: number) {
    return this.scholarshipTransactionsService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Update scholarship transaction" })
  @ApiParam({ name: "id", type: Number, description: "Transaction ID" })
  @ApiResponse({
    status: 200,
    description: "Transaction updated successfully",
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 404, description: "Transaction not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateScholarshipTransactionDto: UpdateScholarshipTransactionDto
  ) {
    return this.scholarshipTransactionsService.update(
      id,
      updateScholarshipTransactionDto
    );
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete scholarship transaction" })
  @ApiParam({ name: "id", type: Number, description: "Transaction ID" })
  @ApiResponse({
    status: 200,
    description: "Transaction deleted successfully",
  })
  @ApiResponse({ status: 400, description: "Invalid transaction ID" })
  @ApiResponse({ status: 404, description: "Transaction not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async remove(@Param("id", ParseIntPipe) id: number) {
    return this.scholarshipTransactionsService.remove(id);
  }

  @Patch(":id/toggle-status")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Toggle transaction active status" })
  @ApiParam({ name: "id", type: Number, description: "Transaction ID" })
  @ApiResponse({ status: 200, description: "Status updated successfully" })
  @ApiResponse({ status: 400, description: "Invalid transaction ID" })
  @ApiResponse({ status: 404, description: "Transaction not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async toggleStatus(@Param("id", ParseIntPipe) id: number) {
    return this.scholarshipTransactionsService.toggleStatus(id);
  }

  @Patch(":id/change-status")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Change transaction status" })
  @ApiParam({ name: "id", type: Number, description: "Transaction ID" })
  @ApiResponse({
    status: 200,
    description: "Transaction status updated successfully",
  })
  @ApiResponse({
    status: 400,
    description: "Invalid transaction ID or status",
  })
  @ApiResponse({ status: 404, description: "Transaction not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async changeStatus(
    @Param("id", ParseIntPipe) id: number,
    @Body("status") status: string
  ) {
    return this.scholarshipTransactionsService.changeStatus(id, status);
  }

  @Get("reports/monthly/:month/:year")
  @ApiOperation({ summary: "Generate monthly scholarship report" })
  @ApiParam({ name: "month", type: String, description: "Month name" })
  @ApiParam({ name: "year", type: Number, description: "Year" })
  @ApiResponse({
    status: 200,
    description: "Return monthly scholarship report",
  })
  @ApiResponse({ status: 400, description: "Invalid month or year" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async generateMonthlyReport(
    @Param("month") month: string,
    @Param("year", ParseIntPipe) year: number
  ) {
    return this.scholarshipTransactionsService.generateMonthlyReport(
      month,
      year
    );
  }

  @Get("reports/student/:studentId/history")
  @ApiOperation({ summary: "Get student payment history" })
  @ApiParam({ name: "studentId", type: Number, description: "Student ID" })
  @ApiResponse({
    status: 200,
    description: "Return student payment history",
  })
  @ApiResponse({ status: 400, description: "Invalid student ID" })
  @ApiResponse({ status: 404, description: "Student not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getStudentPaymentHistory(
    @Param("studentId", ParseIntPipe) studentId: number
  ) {
    return this.scholarshipTransactionsService.getStudentPaymentHistory(
      studentId
    );
  }

  @Get("pending")
  @ApiOperation({ summary: "Get pending scholarship payments" })
  @ApiResponse({
    status: 200,
    description: "Return pending scholarship payments",
  })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getPendingPayments() {
    return this.scholarshipTransactionsService.getPendingPayments();
  }

  @Get("overdue")
  @ApiOperation({ summary: "Get overdue scholarship payments" })
  @ApiResponse({
    status: 200,
    description: "Return overdue scholarship payments",
  })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getOverduePayments() {
    return this.scholarshipTransactionsService.getOverduePayments();
  }

  @Get("reports/yearly/:year")
  @ApiOperation({ summary: "Get yearly scholarship summary" })
  @ApiParam({ name: "year", type: Number, description: "Year" })
  @ApiResponse({
    status: 200,
    description: "Return yearly scholarship summary",
  })
  @ApiResponse({ status: 400, description: "Invalid year" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getYearlySummary(@Param("year", ParseIntPipe) year: number) {
    return this.scholarshipTransactionsService.getMonthlySummary(year);
  }

  @Post(":id/process-payment")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({
    summary: "Process scholarship payment and update student balance",
  })
  @ApiParam({ name: "id", type: Number, description: "Transaction ID" })
  @ApiResponse({
    status: 200,
    description: "Payment processed successfully",
  })
  @ApiResponse({
    status: 400,
    description: "Invalid transaction or already processed",
  })
  @ApiResponse({ status: 404, description: "Transaction not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async processPayment(@Param("id", ParseIntPipe) id: number) {
    return this.scholarshipTransactionsService.processScholarshipPayment(id);
  }

  @Post("create-and-process")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({
    summary: "Create scholarship transaction and process payment if PAID",
  })
  @ApiResponse({
    status: 201,
    description: "Transaction created and processed successfully",
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 404, description: "Student or scholarship not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async createAndProcessTransaction(
    @Body() createTransactionDto: CreateScholarshipTransactionDto
  ) {
    return this.scholarshipTransactionsService.createAndProcessTransaction(
      createTransactionDto
    );
  }

  @Patch(":id/status")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({
    summary: "Update transaction status with automatic balance processing",
  })
  @ApiParam({ name: "id", type: Number, description: "Transaction ID" })
  @ApiResponse({
    status: 200,
    description: "Status updated successfully",
  })
  @ApiResponse({ status: 400, description: "Invalid status" })
  @ApiResponse({ status: 404, description: "Transaction not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async updateStatus(
    @Param("id", ParseIntPipe) id: number,
    @Body("status") status: string
  ) {
    return this.scholarshipTransactionsService.updateTransactionStatus(
      id,
      status
    );
  }
}
