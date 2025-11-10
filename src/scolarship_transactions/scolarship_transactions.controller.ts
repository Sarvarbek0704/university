import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ScolarshipTransactionsService } from './scolarship_transactions.service';
import { CreateScolarshipTransactionDto } from './dto/create-scolarship_transaction.dto';
import { UpdateScolarshipTransactionDto } from './dto/update-scolarship_transaction.dto';

@Controller('scolarship-transactions')
export class ScolarshipTransactionsController {
  constructor(private readonly scolarshipTransactionsService: ScolarshipTransactionsService) {}

  @Post()
  create(@Body() createScolarshipTransactionDto: CreateScolarshipTransactionDto) {
    return this.scolarshipTransactionsService.create(createScolarshipTransactionDto);
  }

  @Get()
  findAll() {
    return this.scolarshipTransactionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.scolarshipTransactionsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateScolarshipTransactionDto: UpdateScolarshipTransactionDto) {
    return this.scolarshipTransactionsService.update(+id, updateScolarshipTransactionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.scolarshipTransactionsService.remove(+id);
  }
}
