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
import { PaymentsService } from "./payments.service";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { UpdatePaymentDto } from "./dto/update-payment.dto";
import { FilterPaymentDto } from "./dto/filter-payment.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AdminGuard } from "../auth/guards/admin.guard";

@ApiTags("payments")
@ApiBearerAuth("JWT-auth")
@Controller("payments")
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Create a new payment" })
  @ApiResponse({ status: 201, description: "Payment created successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({
    status: 404,
    description: "Student or payment type not found",
  })
  @ApiResponse({ status: 409, description: "Transaction ID already exists" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.create(createPaymentDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all payments with filtering" })
  @ApiResponse({ status: 200, description: "Return all payments" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findAll(@Query() filterDto: FilterPaymentDto) {
    return this.paymentsService.findAll(filterDto);
  }

  @Get("stats")
  @ApiOperation({ summary: "Get payments statistics" })
  @ApiResponse({ status: 200, description: "Return payments statistics" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getStats() {
    return this.paymentsService.getPaymentsStats();
  }

  @Get("student/:studentId")
  @ApiOperation({ summary: "Get payments by student ID" })
  @ApiParam({ name: "studentId", type: Number, description: "Student ID" })
  @ApiResponse({ status: 200, description: "Return payments for student" })
  @ApiResponse({ status: 400, description: "Invalid student ID" })
  @ApiResponse({ status: 404, description: "Student not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findByStudent(@Param("studentId", ParseIntPipe) studentId: number) {
    return this.paymentsService.findByStudent(studentId);
  }

  @Get("student/:studentId/summary")
  @ApiOperation({ summary: "Get payment summary for student" })
  @ApiParam({ name: "studentId", type: Number, description: "Student ID" })
  @ApiResponse({ status: 200, description: "Return payment summary" })
  @ApiResponse({ status: 400, description: "Invalid student ID" })
  @ApiResponse({ status: 404, description: "Student not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getStudentPaymentSummary(
    @Param("studentId", ParseIntPipe) studentId: number
  ) {
    return this.paymentsService.getStudentPaymentSummary(studentId);
  }

  @Get("status/:status")
  @ApiOperation({ summary: "Get payments by status" })
  @ApiParam({ name: "status", type: String, description: "Payment status" })
  @ApiResponse({ status: 200, description: "Return payments by status" })
  @ApiResponse({ status: 400, description: "Invalid status" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findByStatus(@Param("status") status: string) {
    return this.paymentsService.findByStatus(status);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get payment by ID" })
  @ApiParam({ name: "id", type: Number, description: "Payment ID" })
  @ApiResponse({ status: 200, description: "Return payment" })
  @ApiResponse({ status: 400, description: "Invalid payment ID" })
  @ApiResponse({ status: 404, description: "Payment not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findOne(@Param("id", ParseIntPipe) id: number) {
    return this.paymentsService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Update payment" })
  @ApiParam({ name: "id", type: Number, description: "Payment ID" })
  @ApiResponse({ status: 200, description: "Payment updated successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 404, description: "Payment not found" })
  @ApiResponse({ status: 409, description: "Transaction ID already exists" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updatePaymentDto: UpdatePaymentDto
  ) {
    return this.paymentsService.update(id, updatePaymentDto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete payment" })
  @ApiParam({ name: "id", type: Number, description: "Payment ID" })
  @ApiResponse({ status: 200, description: "Payment deleted successfully" })
  @ApiResponse({ status: 400, description: "Invalid payment ID" })
  @ApiResponse({ status: 404, description: "Payment not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async remove(@Param("id", ParseIntPipe) id: number) {
    return this.paymentsService.remove(id);
  }

  @Patch(":id/status")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Update payment status" })
  @ApiParam({ name: "id", type: Number, description: "Payment ID" })
  @ApiResponse({
    status: 200,
    description: "Payment status updated successfully",
  })
  @ApiResponse({ status: 400, description: "Invalid payment ID or status" })
  @ApiResponse({ status: 404, description: "Payment not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async updateStatus(
    @Param("id", ParseIntPipe) id: number,
    @Body("status") status: string
  ) {
    return this.paymentsService.updateStatus(id, status);
  }

  @Get(":id/receipt")
  @ApiOperation({ summary: "Generate payment receipt" })
  @ApiParam({ name: "id", type: Number, description: "Payment ID" })
  @ApiResponse({ status: 200, description: "Return payment receipt" })
  @ApiResponse({ status: 400, description: "Invalid payment ID" })
  @ApiResponse({ status: 404, description: "Payment not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async generateReceipt(@Param("id", ParseIntPipe) id: number) {
    return this.paymentsService.generateReceipt(id);
  }
}
