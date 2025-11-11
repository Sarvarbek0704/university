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
import { InstallmentsService } from "./installments.service";
import { CreateInstallmentDto } from "./dto/create-installment.dto";
import { UpdateInstallmentDto } from "./dto/update-installment.dto";
import { PayInstallmentDto } from "./dto/pay-installment.dto";
import { FilterInstallmentDto } from "./dto/filter-installment.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AdminGuard } from "../auth/guards/admin.guard";

@ApiTags("installments")
@ApiBearerAuth("JWT-auth")
@Controller("installments")
export class InstallmentsController {
  constructor(private readonly installmentsService: InstallmentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Create a new installment" })
  @ApiResponse({ status: 201, description: "Installment created successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 404, description: "Rent contract not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async create(@Body() createInstallmentDto: CreateInstallmentDto) {
    return this.installmentsService.create(createInstallmentDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all installments with filtering" })
  @ApiResponse({ status: 200, description: "Return all installments" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findAll(@Query() filterDto: FilterInstallmentDto) {
    return this.installmentsService.findAll(filterDto);
  }

  @Get("stats")
  @ApiOperation({ summary: "Get installments statistics" })
  @ApiResponse({ status: 200, description: "Return installments statistics" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getStats() {
    return this.installmentsService.getInstallmentsStats();
  }

  @Get("overdue")
  @ApiOperation({ summary: "Get overdue installments" })
  @ApiResponse({ status: 200, description: "Return overdue installments" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getOverdueInstallments() {
    return this.installmentsService.getOverdueInstallments();
  }

  @Get("contract/:contractId")
  @ApiOperation({ summary: "Get installments by contract ID" })
  @ApiParam({
    name: "contractId",
    type: Number,
    description: "Rent contract ID",
  })
  @ApiResponse({ status: 200, description: "Return installments for contract" })
  @ApiResponse({ status: 400, description: "Invalid contract ID" })
  @ApiResponse({ status: 404, description: "Contract not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findByContract(@Param("contractId", ParseIntPipe) contractId: number) {
    return this.installmentsService.findByContract(contractId);
  }

  @Get("student/:studentId")
  @ApiOperation({ summary: "Get installments by student ID" })
  @ApiParam({ name: "studentId", type: Number, description: "Student ID" })
  @ApiResponse({ status: 200, description: "Return installments for student" })
  @ApiResponse({ status: 400, description: "Invalid student ID" })
  @ApiResponse({ status: 404, description: "Student not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findByStudent(@Param("studentId", ParseIntPipe) studentId: number) {
    return this.installmentsService.findByStudent(studentId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get installment by ID" })
  @ApiParam({ name: "id", type: Number, description: "Installment ID" })
  @ApiResponse({ status: 200, description: "Return installment" })
  @ApiResponse({ status: 400, description: "Invalid installment ID" })
  @ApiResponse({ status: 404, description: "Installment not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findOne(@Param("id", ParseIntPipe) id: number) {
    return this.installmentsService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Update installment" })
  @ApiParam({ name: "id", type: Number, description: "Installment ID" })
  @ApiResponse({ status: 200, description: "Installment updated successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 404, description: "Installment not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateInstallmentDto: UpdateInstallmentDto
  ) {
    return this.installmentsService.update(id, updateInstallmentDto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete installment" })
  @ApiParam({ name: "id", type: Number, description: "Installment ID" })
  @ApiResponse({ status: 200, description: "Installment deleted successfully" })
  @ApiResponse({ status: 400, description: "Invalid installment ID" })
  @ApiResponse({ status: 404, description: "Installment not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async remove(@Param("id", ParseIntPipe) id: number) {
    return this.installmentsService.remove(id);
  }

  @Post(":id/pay")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Make payment for installment" })
  @ApiParam({ name: "id", type: Number, description: "Installment ID" })
  @ApiResponse({ status: 200, description: "Payment processed successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 404, description: "Installment not found" })
  @ApiResponse({
    status: 409,
    description: "Payment amount exceeds installment amount",
  })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async payInstallment(
    @Param("id", ParseIntPipe) id: number,
    @Body() payInstallmentDto: PayInstallmentDto
  ) {
    return this.installmentsService.payInstallment(id, payInstallmentDto);
  }

  @Patch(":id/status")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Update installment status" })
  @ApiParam({ name: "id", type: Number, description: "Installment ID" })
  @ApiResponse({
    status: 200,
    description: "Installment status updated successfully",
  })
  @ApiResponse({ status: 400, description: "Invalid installment ID or status" })
  @ApiResponse({ status: 404, description: "Installment not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async updateStatus(
    @Param("id", ParseIntPipe) id: number,
    @Body("status") status: string
  ) {
    return this.installmentsService.updateStatus(id, status);
  }

  @Get(":id/overdue-days")
  @ApiOperation({ summary: "Calculate overdue days for installment" })
  @ApiParam({ name: "id", type: Number, description: "Installment ID" })
  @ApiResponse({ status: 200, description: "Return overdue days" })
  @ApiResponse({ status: 400, description: "Invalid installment ID" })
  @ApiResponse({ status: 404, description: "Installment not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getOverdueDays(@Param("id", ParseIntPipe) id: number) {
    return this.installmentsService.getOverdueDays(id);
  }

  @Post("contract/:contractId/generate")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Generate installments for rent contract" })
  @ApiParam({
    name: "contractId",
    type: Number,
    description: "Rent contract ID",
  })
  @ApiResponse({
    status: 201,
    description: "Installments generated successfully",
  })
  @ApiResponse({ status: 400, description: "Invalid contract ID" })
  @ApiResponse({ status: 404, description: "Contract not found" })
  @ApiResponse({
    status: 409,
    description: "Installments already exist for this contract",
  })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async generateInstallments(
    @Param("contractId", ParseIntPipe) contractId: number
  ) {
    return this.installmentsService.generateInstallments(contractId);
  }
}
