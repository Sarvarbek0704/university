import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Op } from "sequelize";
import { BorrowedBook } from "./models/borrowed_book.model";
import { LibraryBook } from "../library_books/models/library_book.model";
import { Student } from "../students/models/student.model";
import { BorrowBookDto } from "./dto/borrow-book.dto";
import { ReturnBookDto } from "./dto/return-book.dto";

@Injectable()
export class BorrowedBooksService {
  constructor(
    @InjectModel(BorrowedBook)
    private readonly borrowedBookModel: typeof BorrowedBook,
    @InjectModel(LibraryBook)
    private readonly libraryBookModel: typeof LibraryBook,
    @InjectModel(Student)
    private readonly studentModel: typeof Student
  ) {}

  async borrow(borrowBookDto: BorrowBookDto): Promise<BorrowedBook> {
    const [student, book] = await Promise.all([
      this.studentModel.findByPk(borrowBookDto.student_id),
      this.libraryBookModel.findByPk(borrowBookDto.book_id),
    ]);

    if (!student) {
      throw new NotFoundException("Student not found");
    }
    if (!book) {
      throw new NotFoundException("Book not found");
    }
    if (!book.isAvailable) {
      throw new BadRequestException("Book is not available");
    }

    // Check if student already has this book
    const existingBorrow = await this.borrowedBookModel.findOne({
      where: {
        student_id: borrowBookDto.student_id,
        book_id: borrowBookDto.book_id,
        status: "CHECKED_OUT",
      },
    });

    if (existingBorrow) {
      throw new BadRequestException("Student already has this book");
    }

    // Calculate due date (2 weeks from now)
    const dueDate = borrowBookDto.due_date
      ? new Date(borrowBookDto.due_date)
      : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    const borrowedBook = await this.borrowedBookModel.create({
      ...borrowBookDto,
      due_date: dueDate,
    });

    // Update book availability
    await book.update({
      available_count: book.available_count - 1,
    });

    return borrowedBook;
  }

  async return(
    id: number,
    returnBookDto: ReturnBookDto
  ): Promise<BorrowedBook> {
    const borrowedBook = await this.borrowedBookModel.findByPk(id, {
      include: [LibraryBook],
    });

    if (!borrowedBook) {
      throw new NotFoundException("Borrowed book record not found");
    }
    if (borrowedBook.isReturned) {
      throw new BadRequestException("Book already returned");
    }

    await borrowedBook.update({
      return_date: new Date(),
      status: "RETURNED",
    });

    // Update book availability
    if (borrowedBook.book) {
      await borrowedBook.book.update({
        available_count: borrowedBook.book.available_count + 1,
      });
    }

    return borrowedBook;
  }

  async findAll(): Promise<BorrowedBook[]> {
    return this.borrowedBookModel.findAll({
      include: [Student, LibraryBook],
      order: [["borrow_date", "DESC"]],
    });
  }

  async findOverdue(): Promise<BorrowedBook[]> {
    return this.borrowedBookModel.findAll({
      where: {
        status: "CHECKED_OUT",
        due_date: { [Op.lt]: new Date() },
      },
      include: [Student, LibraryBook],
      order: [["due_date", "ASC"]],
    });
  }

  async findByStudent(studentId: number): Promise<BorrowedBook[]> {
    const student = await this.studentModel.findByPk(studentId);
    if (!student) {
      throw new NotFoundException("Student not found");
    }

    return this.borrowedBookModel.findAll({
      where: { student_id: studentId },
      include: [LibraryBook],
      order: [["borrow_date", "DESC"]],
    });
  }

  async findByBook(bookId: number): Promise<BorrowedBook[]> {
    const book = await this.libraryBookModel.findByPk(bookId);
    if (!book) {
      throw new NotFoundException("Book not found");
    }

    return this.borrowedBookModel.findAll({
      where: { book_id: bookId },
      include: [Student],
      order: [["borrow_date", "DESC"]],
    });
  }

  async extendDueDate(id: number): Promise<BorrowedBook> {
    const borrowedBook = await this.borrowedBookModel.findByPk(id);

    if (!borrowedBook) {
      throw new NotFoundException("Borrowed book record not found");
    }
    if (borrowedBook.isReturned) {
      throw new BadRequestException("Cannot extend due date for returned book");
    }

    // Extend by 1 week
    const newDueDate = new Date(borrowedBook.due_date);
    newDueDate.setDate(newDueDate.getDate() + 7);

    await borrowedBook.update({
      due_date: newDueDate,
    });

    return borrowedBook;
  }
}
