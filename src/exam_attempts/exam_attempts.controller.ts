import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ExamAttemptsService } from './exam_attempts.service';
import { CreateExamAttemptDto } from './dto/create-exam_attempt.dto';
import { UpdateExamAttemptDto } from './dto/update-exam_attempt.dto';

@Controller('exam-attempts')
export class ExamAttemptsController {
  constructor(private readonly examAttemptsService: ExamAttemptsService) {}

  @Post()
  create(@Body() createExamAttemptDto: CreateExamAttemptDto) {
    return this.examAttemptsService.create(createExamAttemptDto);
  }

  @Get()
  findAll() {
    return this.examAttemptsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.examAttemptsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateExamAttemptDto: UpdateExamAttemptDto) {
    return this.examAttemptsService.update(+id, updateExamAttemptDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.examAttemptsService.remove(+id);
  }
}
