import { Module } from '@nestjs/common';
import { LibraryBooksService } from './library_books.service';
import { LibraryBooksController } from './library_books.controller';

@Module({
  controllers: [LibraryBooksController],
  providers: [LibraryBooksService],
})
export class LibraryBooksModule {}
