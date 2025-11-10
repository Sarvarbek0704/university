import { Injectable } from '@nestjs/common';
import { CreateExamResultDto } from './dto/create-exam_result.dto';
import { UpdateExamResultDto } from './dto/update-exam_result.dto';

@Injectable()
export class ExamResultsService {
  create(createExamResultDto: CreateExamResultDto) {
    return 'This action adds a new examResult';
  }

  findAll() {
    return `This action returns all examResults`;
  }

  findOne(id: number) {
    return `This action returns a #${id} examResult`;
  }

  update(id: number, updateExamResultDto: UpdateExamResultDto) {
    return `This action updates a #${id} examResult`;
  }

  remove(id: number) {
    return `This action removes a #${id} examResult`;
  }
}
