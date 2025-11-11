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
  ParseIntPipe,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { StudentCreditsService } from "./student_credits.service";
import { CreateStudentCreditDto } from "./dto/create-student_credit.dto";
import { UpdateStudentCreditDto } from "./dto/update-student_credit.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags("student-credits")
@ApiBearerAuth("JWT-auth")
@Controller("student-credits")
export class StudentCreditsController {
  constructor(private readonly studentCreditsService: StudentCreditsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Create student credit record" })
  async create(@Body() createStudentCreditDto: CreateStudentCreditDto) {
    return this.studentCreditsService.create(createStudentCreditDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all student credits" })
  async findAll() {
    return this.studentCreditsService.findAll();
  }

  @Get("student/:studentId")
  @ApiOperation({ summary: "Get student credits by student ID" })
  async findByStudent(@Param("studentId", ParseIntPipe) studentId: number) {
    return this.studentCreditsService.findByStudent(studentId);
  }

  @Get("student/:studentId/summary")
  @ApiOperation({ summary: "Get student academic summary" })
  async getStudentSummary(@Param("studentId", ParseIntPipe) studentId: number) {
    return this.studentCreditsService.getStudentCreditsOverview(studentId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get student credit by ID" })
  async findOne(@Param("id", ParseIntPipe) id: number) {
    return this.studentCreditsService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Update student credit" })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateStudentCreditDto: UpdateStudentCreditDto
  ) {
    return this.studentCreditsService.update(id, updateStudentCreditDto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Delete student credit" })
  async remove(@Param("id", ParseIntPipe) id: number) {
    return this.studentCreditsService.remove(id);
  }

  @Post("calculate/:studentId")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Calculate student GPA and credits" })
  async calculateStudentCredits(
    @Param("studentId", ParseIntPipe) studentId: number
  ) {
    return this.studentCreditsService.calculateStudentCredits(studentId);
  }
}
