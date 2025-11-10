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
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { AdminService } from "./admin.service";
import { CreateAdminDto } from "./dto/create-admin.dto";
import { UpdateAdminDto } from "./dto/update-admin.dto";
import { FilterAdminDto } from "./dto/filter-admin.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AdminGuard } from "../auth/guards/admin.guard";

@ApiTags("admin")
@ApiBearerAuth("JWT-auth")
@Controller("admin")
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post()
  @ApiOperation({ summary: "Create a new admin" })
  @ApiResponse({ status: 201, description: "Admin created successfully" })
  @ApiResponse({ status: 409, description: "Email or phone already exists" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async create(@Body() createAdminDto: CreateAdminDto) {
    try {
      return await this.adminService.create(createAdminDto);
    } catch (error) {
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: "Get all admins with filtering" })
  @ApiResponse({ status: 200, description: "Return all admins" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findAll(@Query() filterDto: FilterAdminDto) {
    try {
      return await this.adminService.findAll(filterDto);
    } catch (error) {
      throw error;
    }
  }

  @Get(":id")
  @ApiOperation({ summary: "Get admin by ID" })
  @ApiResponse({ status: 200, description: "Return admin" })
  @ApiResponse({ status: 404, description: "Admin not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async findOne(@Param("id") id: string) {
    try {
      return await this.adminService.findOne(+id);
    } catch (error) {
      throw error;
    }
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update admin" })
  @ApiResponse({ status: 200, description: "Admin updated successfully" })
  @ApiResponse({ status: 404, description: "Admin not found" })
  @ApiResponse({ status: 409, description: "Email or phone already exists" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async update(
    @Param("id") id: string,
    @Body() updateAdminDto: UpdateAdminDto
  ) {
    try {
      return await this.adminService.update(+id, updateAdminDto);
    } catch (error) {
      throw error;
    }
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete admin" })
  @ApiResponse({ status: 200, description: "Admin deleted successfully" })
  @ApiResponse({ status: 404, description: "Admin not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async remove(@Param("id") id: string) {
    try {
      return await this.adminService.remove(+id);
    } catch (error) {
      throw error;
    }
  }

  @Patch(":id/toggle-status")
  @ApiOperation({ summary: "Toggle admin active status" })
  @ApiResponse({ status: 200, description: "Status updated successfully" })
  @ApiResponse({ status: 404, description: "Admin not found" })
  @ApiResponse({ status: 500, description: "Internal server error" })
  async toggleStatus(@Param("id") id: string) {
    try {
      return await this.adminService.toggleStatus(+id);
    } catch (error) {
      throw error;
    }
  }
}
