import { Injectable } from '@nestjs/common';
import { CreatePrerequisiteDto } from './dto/create-prerequisite.dto';
import { UpdatePrerequisiteDto } from './dto/update-prerequisite.dto';

@Injectable()
export class PrerequisitesService {
  create(createPrerequisiteDto: CreatePrerequisiteDto) {
    return 'This action adds a new prerequisite';
  }

  findAll() {
    return `This action returns all prerequisites`;
  }

  findOne(id: number) {
    return `This action returns a #${id} prerequisite`;
  }

  update(id: number, updatePrerequisiteDto: UpdatePrerequisiteDto) {
    return `This action updates a #${id} prerequisite`;
  }

  remove(id: number) {
    return `This action removes a #${id} prerequisite`;
  }
}
