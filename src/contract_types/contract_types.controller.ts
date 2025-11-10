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
import { ContractTypesService } from "./contract_types.service";
import { CreateContractTypeDto } from "./dto/create-contract_type.dto";
import { UpdateContractTypeDto } from "./dto/update-contract_type.dto";
import { FilterContractTypeDto } from "./dto/filter-contract-type.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AdminGuard } from "../auth/guards/admin.guard";

@ApiTags("contract-types")
@ApiBearerAuth("JWT-auth")
@Controller("contract-types")
export class ContractTypesController {
  constructor(private readonly contractTypesService: ContractTypesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Create a new contract type" })
  @ApiResponse({
    status: 201,
    description: "Contract type created successfully",
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({
    status: 409,
    description: "Contract type name already exists",
  })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async create(@Body() createContractTypeDto: CreateContractTypeDto) {
    return this.contractTypesService.create(createContractTypeDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all contract types with filtering" })
  @ApiResponse({ status: 200, description: "Return all contract types" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findAll(@Query() filterDto: FilterContractTypeDto) {
    return this.contractTypesService.findAll(filterDto);
  }

  @Get("count")
  @ApiOperation({ summary: "Get contract types statistics" })
  @ApiResponse({ status: 200, description: "Return contract types count" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async getCount() {
    return this.contractTypesService.getContractTypesCount();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get contract type by ID" })
  @ApiParam({ name: "id", type: Number, description: "Contract type ID" })
  @ApiResponse({ status: 200, description: "Return contract type" })
  @ApiResponse({ status: 400, description: "Invalid contract type ID" })
  @ApiResponse({ status: 404, description: "Contract type not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findOne(@Param("id", ParseIntPipe) id: number) {
    return this.contractTypesService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Update contract type" })
  @ApiParam({ name: "id", type: Number, description: "Contract type ID" })
  @ApiResponse({
    status: 200,
    description: "Contract type updated successfully",
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 404, description: "Contract type not found" })
  @ApiResponse({
    status: 409,
    description: "Contract type name already exists",
  })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateContractTypeDto: UpdateContractTypeDto
  ) {
    return this.contractTypesService.update(id, updateContractTypeDto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete contract type" })
  @ApiParam({ name: "id", type: Number, description: "Contract type ID" })
  @ApiResponse({
    status: 200,
    description: "Contract type deleted successfully",
  })
  @ApiResponse({ status: 400, description: "Invalid contract type ID" })
  @ApiResponse({ status: 404, description: "Contract type not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async remove(@Param("id", ParseIntPipe) id: number) {
    return this.contractTypesService.remove(id);
  }

  @Patch(":id/toggle-status")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Toggle contract type active status" })
  @ApiParam({ name: "id", type: Number, description: "Contract type ID" })
  @ApiResponse({ status: 200, description: "Status updated successfully" })
  @ApiResponse({ status: 400, description: "Invalid contract type ID" })
  @ApiResponse({ status: 404, description: "Contract type not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async toggleStatus(@Param("id", ParseIntPipe) id: number) {
    return this.contractTypesService.toggleStatus(id);
  }
}
