import { Injectable } from '@nestjs/common';
import { CreateExamAttemptDto } from './dto/create-exam_attempt.dto';
import { UpdateExamAttemptDto } from './dto/update-exam_attempt.dto';

@Injectable()
export class ExamAttemptsService {
  create(createExamAttemptDto: CreateExamAttemptDto) {
    return 'This action adds a new examAttempt';
  }

  findAll() {
    return `This action returns all examAttempts`;
  }

  findOne(id: number) {
    return `This action returns a #${id} examAttempt`;
  }

  update(id: number, updateExamAttemptDto: UpdateExamAttemptDto) {
    return `This action updates a #${id} examAttempt`;
  }

  remove(id: number) {
    return `This action removes a #${id} examAttempt`;
  }
}
