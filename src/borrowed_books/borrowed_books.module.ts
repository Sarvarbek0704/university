import { Module } from '@nestjs/common';
import { BorrowedBooksService } from './borrowed_books.service';
import { BorrowedBooksController } from './borrowed_books.controller';

@Module({
  controllers: [BorrowedBooksController],
  providers: [BorrowedBooksService],
})
export class BorrowedBooksModule {}
