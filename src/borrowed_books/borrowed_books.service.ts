import { Injectable } from '@nestjs/common';
import { CreateBorrowedBookDto } from './dto/create-borrowed_book.dto';
import { UpdateBorrowedBookDto } from './dto/update-borrowed_book.dto';

@Injectable()
export class BorrowedBooksService {
  create(createBorrowedBookDto: CreateBorrowedBookDto) {
    return 'This action adds a new borrowedBook';
  }

  findAll() {
    return `This action returns all borrowedBooks`;
  }

  findOne(id: number) {
    return `This action returns a #${id} borrowedBook`;
  }

  update(id: number, updateBorrowedBookDto: UpdateBorrowedBookDto) {
    return `This action updates a #${id} borrowedBook`;
  }

  remove(id: number) {
    return `This action removes a #${id} borrowedBook`;
  }
}
