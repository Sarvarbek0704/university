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
import { PaymentTypesService } from "./payment_types.service";
import { CreatePaymentTypeDto } from "./dto/create-payment_type.dto";
import { UpdatePaymentTypeDto } from "./dto/update-payment_type.dto";
import { FilterPaymentTypeDto } from "./dto/filter-payment-type.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AdminGuard } from "../auth/guards/admin.guard";

@ApiTags("payment-types")
@ApiBearerAuth("JWT-auth")
@Controller("payment-types")
export class PaymentTypesController {
  constructor(private readonly paymentTypesService: PaymentTypesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Create a new payment type" })
  @ApiResponse({
    status: 201,
    description: "Payment type created successfully",
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 409, description: "Payment type name already exists" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async create(@Body() createPaymentTypeDto: CreatePaymentTypeDto) {
    return this.paymentTypesService.create(createPaymentTypeDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all payment types with filtering" })
  @ApiResponse({ status: 200, description: "Return all payment types" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findAll(@Query() filterDto: FilterPaymentTypeDto) {
    return this.paymentTypesService.findAll(filterDto);
  }

  @Get("count")
  @ApiOperation({ summary: "Get payment types statistics" })
  @ApiResponse({ status: 200, description: "Return payment types count" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getCount() {
    return this.paymentTypesService.getPaymentTypesCount();
  }

  @Get("active")
  @ApiOperation({ summary: "Get active payment types" })
  @ApiResponse({ status: 200, description: "Return active payment types" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getActivePaymentTypes() {
    return this.paymentTypesService.getActivePaymentTypes();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get payment type by ID" })
  @ApiParam({ name: "id", type: Number, description: "Payment type ID" })
  @ApiResponse({ status: 200, description: "Return payment type" })
  @ApiResponse({ status: 400, description: "Invalid payment type ID" })
  @ApiResponse({ status: 404, description: "Payment type not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findOne(@Param("id", ParseIntPipe) id: number) {
    return this.paymentTypesService.findOne(id);
  }

  @Get(":id/with-payments")
  @ApiOperation({ summary: "Get payment type with payments" })
  @ApiParam({ name: "id", type: Number, description: "Payment type ID" })
  @ApiResponse({
    status: 200,
    description: "Return payment type with payments",
  })
  @ApiResponse({ status: 400, description: "Invalid payment type ID" })
  @ApiResponse({ status: 404, description: "Payment type not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getPaymentTypeWithPayments(@Param("id", ParseIntPipe) id: number) {
    return this.paymentTypesService.getPaymentTypeWithPayments(id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Update payment type" })
  @ApiParam({ name: "id", type: Number, description: "Payment type ID" })
  @ApiResponse({
    status: 200,
    description: "Payment type updated successfully",
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 404, description: "Payment type not found" })
  @ApiResponse({ status: 409, description: "Payment type name already exists" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updatePaymentTypeDto: UpdatePaymentTypeDto
  ) {
    return this.paymentTypesService.update(id, updatePaymentTypeDto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete payment type" })
  @ApiParam({ name: "id", type: Number, description: "Payment type ID" })
  @ApiResponse({
    status: 200,
    description: "Payment type deleted successfully",
  })
  @ApiResponse({ status: 400, description: "Invalid payment type ID" })
  @ApiResponse({ status: 404, description: "Payment type not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async remove(@Param("id", ParseIntPipe) id: number) {
    return this.paymentTypesService.remove(id);
  }

  @Patch(":id/toggle-status")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Toggle payment type active status" })
  @ApiParam({ name: "id", type: Number, description: "Payment type ID" })
  @ApiResponse({ status: 200, description: "Status updated successfully" })
  @ApiResponse({ status: 400, description: "Invalid payment type ID" })
  @ApiResponse({ status: 404, description: "Payment type not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async toggleStatus(@Param("id", ParseIntPipe) id: number) {
    return this.paymentTypesService.toggleStatus(id);
  }
}
