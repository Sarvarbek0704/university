import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { StudentCreditsService } from './student_credits.service';
import { CreateStudentCreditDto } from './dto/create-student_credit.dto';
import { UpdateStudentCreditDto } from './dto/update-student_credit.dto';

@Controller('student-credits')
export class StudentCreditsController {
  constructor(private readonly studentCreditsService: StudentCreditsService) {}

  @Post()
  create(@Body() createStudentCreditDto: CreateStudentCreditDto) {
    return this.studentCreditsService.create(createStudentCreditDto);
  }

  @Get()
  findAll() {
    return this.studentCreditsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.studentCreditsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStudentCreditDto: UpdateStudentCreditDto) {
    return this.studentCreditsService.update(+id, updateStudentCreditDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.studentCreditsService.remove(+id);
  }
}
