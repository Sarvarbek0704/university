import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { BorrowedBooksService } from "./borrowed_books.service";
import { BorrowBookDto } from "./dto/borrow-book.dto";
import { ReturnBookDto } from "./dto/return-book.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags("borrowed-books")
@ApiBearerAuth("JWT-auth")
@Controller("borrowed-books")
export class BorrowedBooksController {
  constructor(private readonly borrowedBooksService: BorrowedBooksService) {}

  @Post("borrow")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Borrow a book" })
  borrow(@Body() borrowBookDto: BorrowBookDto) {
    return this.borrowedBooksService.borrow(borrowBookDto);
  }

  @Post("return/:id")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Return a book" })
  return(
    @Param("id", ParseIntPipe) id: number,
    @Body() returnBookDto: ReturnBookDto
  ) {
    return this.borrowedBooksService.return(id, returnBookDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all borrowed books" })
  findAll() {
    return this.borrowedBooksService.findAll();
  }

  @Get("overdue")
  @ApiOperation({ summary: "Get overdue books" })
  findOverdue() {
    return this.borrowedBooksService.findOverdue();
  }

  @Get("student/:studentId")
  @ApiOperation({ summary: "Get student's borrowed books" })
  findByStudent(@Param("studentId", ParseIntPipe) studentId: number) {
    return this.borrowedBooksService.findByStudent(studentId);
  }

  @Get("book/:bookId")
  @ApiOperation({ summary: "Get book borrowing history" })
  findByBook(@Param("bookId", ParseIntPipe) bookId: number) {
    return this.borrowedBooksService.findByBook(bookId);
  }

  @Patch("extend/:id")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Extend due date" })
  extendDueDate(@Param("id", ParseIntPipe) id: number) {
    return this.borrowedBooksService.extendDueDate(id);
  }
}
