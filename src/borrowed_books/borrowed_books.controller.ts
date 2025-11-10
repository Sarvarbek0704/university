import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BorrowedBooksService } from './borrowed_books.service';
import { CreateBorrowedBookDto } from './dto/create-borrowed_book.dto';
import { UpdateBorrowedBookDto } from './dto/update-borrowed_book.dto';

@Controller('borrowed-books')
export class BorrowedBooksController {
  constructor(private readonly borrowedBooksService: BorrowedBooksService) {}

  @Post()
  create(@Body() createBorrowedBookDto: CreateBorrowedBookDto) {
    return this.borrowedBooksService.create(createBorrowedBookDto);
  }

  @Get()
  findAll() {
    return this.borrowedBooksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.borrowedBooksService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBorrowedBookDto: UpdateBorrowedBookDto) {
    return this.borrowedBooksService.update(+id, updateBorrowedBookDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.borrowedBooksService.remove(+id);
  }
}
