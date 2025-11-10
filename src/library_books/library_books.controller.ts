import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LibraryBooksService } from './library_books.service';
import { CreateLibraryBookDto } from './dto/create-library_book.dto';
import { UpdateLibraryBookDto } from './dto/update-library_book.dto';

@Controller('library-books')
export class LibraryBooksController {
  constructor(private readonly libraryBooksService: LibraryBooksService) {}

  @Post()
  create(@Body() createLibraryBookDto: CreateLibraryBookDto) {
    return this.libraryBooksService.create(createLibraryBookDto);
  }

  @Get()
  findAll() {
    return this.libraryBooksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.libraryBooksService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLibraryBookDto: UpdateLibraryBookDto) {
    return this.libraryBooksService.update(+id, updateLibraryBookDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.libraryBooksService.remove(+id);
  }
}
