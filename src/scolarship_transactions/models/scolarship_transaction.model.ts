import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  Default,
  AllowNull,
  BeforeUpdate,
  BeforeCreate,
} from "sequelize-typescript";
import { Student } from "../../students/models/student.model";
import { Scholarship } from "../../scholarships/models/scholarship.model";

@Table({
  tableName: "scholarship_transactions",
  timestamps: true,
  paranoid: true,
  indexes: [
    {
      fields: ["student_id"],
    },
    {
      fields: ["scholarship_id"],
    },
    {
      fields: ["payment_date"],
    },
    {
      fields: ["period"],
    },
    {
      fields: ["status"],
    },
    {
      fields: ["created_at"],
    },
  ],
})
export class ScholarshipTransaction extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @ForeignKey(() => Student)
  @Column({
    type: DataType.BIGINT,
    allowNull: false,
    validate: {
      min: {
        args: [1],
        msg: "Student ID must be a positive number",
      },
    },
  })
  student_id: number;

  @ForeignKey(() => Scholarship)
  @Column({
    type: DataType.BIGINT,
    allowNull: false,
    validate: {
      min: {
        args: [1],
        msg: "Scholarship ID must be a positive number",
      },
    },
  })
  scholarship_id: number;

  @Column({
    type: DataType.DECIMAL(8, 2),
    allowNull: false,
    validate: {
      min: {
        args: [0],
        msg: "Amount cannot be negative",
      },
    },
  })
  amount: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  payment_date: Date;

  @Column({
    type: DataType.ENUM(
      "JANUARY",
      "FEBRUARY",
      "MARCH",
      "APRIL",
      "MAY",
      "JUNE",
      "JULY",
      "AUGUST",
      "SEPTEMBER",
      "OCTOBER",
      "NOVEMBER",
      "DECEMBER"
    ),
    allowNull: false,
    validate: {
      isIn: {
        args: [
          [
            "JANUARY",
            "FEBRUARY",
            "MARCH",
            "APRIL",
            "MAY",
            "JUNE",
            "JULY",
            "AUGUST",
            "SEPTEMBER",
            "OCTOBER",
            "NOVEMBER",
            "DECEMBER",
          ],
        ],
        msg: "Invalid period value",
      },
    },
  })
  period: string;

  @Column({
    type: DataType.ENUM("PAID", "PENDING", "FAILED"),
    allowNull: false,
    defaultValue: "PENDING",
    validate: {
      isIn: {
        args: [["PAID", "PENDING", "FAILED"]],
        msg: "Invalid status value",
      },
    },
  })
  status: string;

  @Default(DataType.NOW)
  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  created_at: Date;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  remarks: string;

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
  })
  is_processed: boolean;

  @Default(true)
  @AllowNull(false)
  @Column({
    type: DataType.BOOLEAN,
  })
  is_active: boolean;

  @BelongsTo(() => Student)
  student: Student;

  @BelongsTo(() => Scholarship)
  scholarship: Scholarship;

  @BeforeUpdate
  @BeforeCreate
  static validateTransactionData(transaction: ScholarshipTransaction) {
    if (transaction.amount < 0) {
      throw new Error("Amount cannot be negative");
    }
  }

  get formattedAmount(): string {
    return `$${this.amount.toFixed(2)}`;
  }

  get isPaid(): boolean {
    return this.status === "PAID";
  }

  get isPending(): boolean {
    return this.status === "PENDING";
  }

  get isFailed(): boolean {
    return this.status === "FAILED";
  }
}
