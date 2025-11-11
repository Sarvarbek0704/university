import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  Default,
  AllowNull,
} from "sequelize-typescript";
import { Student } from "../../students/models/student.model";
import { LibraryBook } from "../../library_books/models/library_book.model";

@Table({
  tableName: "borrowed_books",
  timestamps: true,
})
export class BorrowedBook extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @ForeignKey(() => Student)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  student_id: number;

  @ForeignKey(() => LibraryBook)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  book_id: number;

  @Default(() => new Date())
  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  borrow_date: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  due_date: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  return_date: Date;

  @Default("CHECKED_OUT")
  @Column({
    type: DataType.ENUM("CHECKED_OUT", "RETURNED", "OVERDUE", "LOST"),
    allowNull: false,
  })
  status: string;

  @BelongsTo(() => Student)
  student: Student;

  @BelongsTo(() => LibraryBook)
  book: LibraryBook;

  get isOverdue(): boolean {
    return new Date() > this.due_date && this.status === "CHECKED_OUT";
  }

  get isReturned(): boolean {
    return this.status === "RETURNED";
  }

  get daysOverdue(): number {
    if (this.isReturned || !this.isOverdue) return 0;
    const today = new Date();
    const diffTime = today.getTime() - this.due_date.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
