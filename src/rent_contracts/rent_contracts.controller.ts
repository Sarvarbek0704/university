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
import { RentContractsService } from "./rent_contracts.service";
import { CreateRentContractDto } from "./dto/create-rent_contract.dto";
import { UpdateRentContractDto } from "./dto/update-rent_contract.dto";
import { FilterRentContractDto } from "./dto/filter-rent-contract.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AdminGuard } from "../auth/guards/admin.guard";

@ApiTags("rent-contracts")
@ApiBearerAuth("JWT-auth")
@Controller("rent-contracts")
export class RentContractsController {
  constructor(private readonly rentContractsService: RentContractsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Create a new rent contract" })
  @ApiResponse({
    status: 201,
    description: "Rent contract created successfully",
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 404, description: "Student not found" })
  @ApiResponse({
    status: 409,
    description: "Student already has active rent contract",
  })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async create(@Body() createRentContractDto: CreateRentContractDto) {
    return this.rentContractsService.create(createRentContractDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all rent contracts with filtering" })
  @ApiResponse({ status: 200, description: "Return all rent contracts" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findAll(@Query() filterDto: FilterRentContractDto) {
    return this.rentContractsService.findAll(filterDto);
  }

  @Get("stats")
  @ApiOperation({ summary: "Get rent contracts statistics" })
  @ApiResponse({ status: 200, description: "Return rent contracts statistics" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getStats() {
    return this.rentContractsService.getRentContractsStats();
  }

  @Get("active")
  @ApiOperation({ summary: "Get active rent contracts" })
  @ApiResponse({ status: 200, description: "Return active rent contracts" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getActiveContracts() {
    return this.rentContractsService.getActiveContracts();
  }

  @Get("expiring")
  @ApiOperation({ summary: "Get expiring rent contracts (within 30 days)" })
  @ApiResponse({ status: 200, description: "Return expiring rent contracts" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getExpiringContracts() {
    return this.rentContractsService.getExpiringContracts();
  }

  @Get("student/:studentId")
  @ApiOperation({ summary: "Get rent contracts by student ID" })
  @ApiParam({ name: "studentId", type: Number, description: "Student ID" })
  @ApiResponse({
    status: 200,
    description: "Return rent contracts for student",
  })
  @ApiResponse({ status: 400, description: "Invalid student ID" })
  @ApiResponse({ status: 404, description: "Student not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findByStudent(@Param("studentId", ParseIntPipe) studentId: number) {
    return this.rentContractsService.findByStudent(studentId);
  }

  @Get("student/:studentId/active")
  @ApiOperation({ summary: "Get active rent contract for student" })
  @ApiParam({ name: "studentId", type: Number, description: "Student ID" })
  @ApiResponse({ status: 200, description: "Return active rent contract" })
  @ApiResponse({ status: 400, description: "Invalid student ID" })
  @ApiResponse({
    status: 404,
    description: "Student or active contract not found",
  })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findActiveByStudent(
    @Param("studentId", ParseIntPipe) studentId: number
  ) {
    return this.rentContractsService.findActiveByStudent(studentId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get rent contract by ID" })
  @ApiParam({ name: "id", type: Number, description: "Rent contract ID" })
  @ApiResponse({ status: 200, description: "Return rent contract" })
  @ApiResponse({ status: 400, description: "Invalid rent contract ID" })
  @ApiResponse({ status: 404, description: "Rent contract not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findOne(@Param("id", ParseIntPipe) id: number) {
    return this.rentContractsService.findOne(id);
  }

  @Get(":id/full")
  @ApiOperation({ summary: "Get rent contract with installments" })
  @ApiParam({ name: "id", type: Number, description: "Rent contract ID" })
  @ApiResponse({
    status: 200,
    description: "Return rent contract with installments",
  })
  @ApiResponse({ status: 400, description: "Invalid rent contract ID" })
  @ApiResponse({ status: 404, description: "Rent contract not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findOneWithInstallments(@Param("id", ParseIntPipe) id: number) {
    return this.rentContractsService.findOneWithInstallments(id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Update rent contract" })
  @ApiParam({ name: "id", type: Number, description: "Rent contract ID" })
  @ApiResponse({
    status: 200,
    description: "Rent contract updated successfully",
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 404, description: "Rent contract not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateRentContractDto: UpdateRentContractDto
  ) {
    return this.rentContractsService.update(id, updateRentContractDto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete rent contract" })
  @ApiParam({ name: "id", type: Number, description: "Rent contract ID" })
  @ApiResponse({
    status: 200,
    description: "Rent contract deleted successfully",
  })
  @ApiResponse({ status: 400, description: "Invalid rent contract ID" })
  @ApiResponse({ status: 404, description: "Rent contract not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async remove(@Param("id", ParseIntPipe) id: number) {
    return this.rentContractsService.remove(id);
  }

  @Patch(":id/status")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Update rent contract status" })
  @ApiParam({ name: "id", type: Number, description: "Rent contract ID" })
  @ApiResponse({
    status: 200,
    description: "Rent contract status updated successfully",
  })
  @ApiResponse({
    status: 400,
    description: "Invalid rent contract ID or status",
  })
  @ApiResponse({ status: 404, description: "Rent contract not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async updateStatus(
    @Param("id", ParseIntPipe) id: number,
    @Body("status") status: string
  ) {
    return this.rentContractsService.updateStatus(id, status);
  }

  @Patch(":id/toggle-status")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Toggle rent contract active status" })
  @ApiParam({ name: "id", type: Number, description: "Rent contract ID" })
  @ApiResponse({ status: 200, description: "Status updated successfully" })
  @ApiResponse({ status: 400, description: "Invalid rent contract ID" })
  @ApiResponse({ status: 404, description: "Rent contract not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async toggleStatus(@Param("id", ParseIntPipe) id: number) {
    return this.rentContractsService.toggleStatus(id);
  }

  @Get(":id/calculate-payments")
  @ApiOperation({ summary: "Calculate payment schedule for rent contract" })
  @ApiParam({ name: "id", type: Number, description: "Rent contract ID" })
  @ApiResponse({ status: 200, description: "Return payment schedule" })
  @ApiResponse({ status: 400, description: "Invalid rent contract ID" })
  @ApiResponse({ status: 404, description: "Rent contract not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async calculatePaymentSchedule(@Param("id", ParseIntPipe) id: number) {
    return this.rentContractsService.calculatePaymentSchedule(id);
  }
}
