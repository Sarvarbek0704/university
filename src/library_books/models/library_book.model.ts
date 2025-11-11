import {
  Table,
  Column,
  Model,
  DataType,
  Default,
  AllowNull,
  HasMany,
} from "sequelize-typescript";
import { BorrowedBook } from "../../borrowed_books/models/borrowed_book.model";

@Table({
  tableName: "library_books",
  timestamps: true,
})
export class LibraryBook extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  title: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  author: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    unique: true,
  })
  isbn: string;

  @Column({
    type: DataType.ENUM(
      "TEXTBOOK",
      "REFERENCE",
      "FICTION",
      "NON_FICTION",
      "RESEARCH"
    ),
    allowNull: false,
    defaultValue: "TEXTBOOK",
  })
  category: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  year: number;

  @Default(1)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  available_count: number;

  @Default(1)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  total_copies: number;

  @HasMany(() => BorrowedBook)
  borrowed_books: BorrowedBook[];

  get isAvailable(): boolean {
    return this.available_count > 0;
  }

  get borrowedCount(): number {
    return this.total_copies - this.available_count;
  }
}
