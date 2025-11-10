import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { InternshipsService } from './internships.service';
import { CreateInternshipDto } from './dto/create-internship.dto';
import { UpdateInternshipDto } from './dto/update-internship.dto';

@Controller('internships')
export class InternshipsController {
  constructor(private readonly internshipsService: InternshipsService) {}

  @Post()
  create(@Body() createInternshipDto: CreateInternshipDto) {
    return this.internshipsService.create(createInternshipDto);
  }

  @Get()
  findAll() {
    return this.internshipsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.internshipsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateInternshipDto: UpdateInternshipDto) {
    return this.internshipsService.update(+id, updateInternshipDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.internshipsService.remove(+id);
  }
}
