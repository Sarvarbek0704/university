import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from "@nestjs/common";
import { StudentService } from "./students.service";
import { CreateStudentDto } from "./dto/create-student.dto";
import { UpdateStudentDto } from "./dto/update-student.dto";
import { ApiOperation, ApiParam, ApiResponse } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AdminGuard } from "../auth/guards/admin.guard";
import { UpdateBalanceDto } from "./dto/update-balance.dto";

@Controller("students")
export class StudentController {
  constructor(private readonly studentsService: StudentService) {}

  // @Post()
  // create(@Body() createStudentDto: CreateStudentDto) {
  //   return this.studentsService.create(createStudentDto);
  // }

  @Get()
  findAll() {
    return this.studentsService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.studentsService.findOne(+id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateStudentDto: UpdateStudentDto) {
    return this.studentsService.update(+id, updateStudentDto);
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.studentsService.remove(+id);
  // }

  // src/students/students.controller.ts - balance endpointlari
  @Patch(":id/balance")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Update student balance" })
  @ApiParam({ name: "id", type: Number, description: "Student ID" })
  @ApiResponse({ status: 200, description: "Balance updated successfully" })
  @ApiResponse({ status: 400, description: "Invalid student ID" })
  @ApiResponse({ status: 404, description: "Student not found" })
  @ApiResponse({ status: 500, description: "Failed to update balance" })
  async updateBalance(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateBalanceDto: UpdateBalanceDto
  ) {
    return this.studentsService.updateBalance(id, updateBalanceDto);
  }

  @Get(":id/balance")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Get student balance" })
  @ApiParam({ name: "id", type: Number, description: "Student ID" })
  @ApiResponse({ status: 200, description: "Balance retrieved successfully" })
  @ApiResponse({ status: 400, description: "Invalid student ID" })
  @ApiResponse({ status: 404, description: "Student not found" })
  @ApiResponse({ status: 500, description: "Failed to get balance" })
  async getBalance(@Param("id", ParseIntPipe) id: number) {
    return this.studentsService.getBalance(id);
  }
}
