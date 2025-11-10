import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FailedSubjectsService } from './failed_subjects.service';
import { CreateFailedSubjectDto } from './dto/create-failed_subject.dto';
import { UpdateFailedSubjectDto } from './dto/update-failed_subject.dto';

@Controller('failed-subjects')
export class FailedSubjectsController {
  constructor(private readonly failedSubjectsService: FailedSubjectsService) {}

  @Post()
  create(@Body() createFailedSubjectDto: CreateFailedSubjectDto) {
    return this.failedSubjectsService.create(createFailedSubjectDto);
  }

  @Get()
  findAll() {
    return this.failedSubjectsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.failedSubjectsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFailedSubjectDto: UpdateFailedSubjectDto) {
    return this.failedSubjectsService.update(+id, updateFailedSubjectDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.failedSubjectsService.remove(+id);
  }
}
