import { Injectable } from '@nestjs/common';
import { CreateLibraryBookDto } from './dto/create-library_book.dto';
import { UpdateLibraryBookDto } from './dto/update-library_book.dto';

@Injectable()
export class LibraryBooksService {
  create(createLibraryBookDto: CreateLibraryBookDto) {
    return 'This action adds a new libraryBook';
  }

  findAll() {
    return `This action returns all libraryBooks`;
  }

  findOne(id: number) {
    return `This action returns a #${id} libraryBook`;
  }

  update(id: number, updateLibraryBookDto: UpdateLibraryBookDto) {
    return `This action updates a #${id} libraryBook`;
  }

  remove(id: number) {
    return `This action removes a #${id} libraryBook`;
  }
}
