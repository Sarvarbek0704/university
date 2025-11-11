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
import { PaymentType } from "../../payment_types/models/payment_type.model";

@Table({
  tableName: "payments",
  timestamps: true,
  paranoid: true,
  indexes: [
    {
      fields: ["student_id"],
    },
    {
      fields: ["payment_type_id"],
    },
    {
      fields: ["payment_date"],
    },
    {
      fields: ["status"],
    },
    {
      fields: ["payment_method"],
    },
    {
      unique: true,
      fields: ["transaction_id"],
      where: {
        transaction_id: {
          [Symbol.for("not")]: null,
        },
      },
    },
  ],
})
export class Payment extends Model {
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
    validate: {
      min: {
        args: [1],
        msg: "Student ID must be a positive number",
      },
    },
  })
  student_id: number;

  @ForeignKey(() => PaymentType)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      min: {
        args: [1],
        msg: "Payment type ID must be a positive number",
      },
    },
  })
  payment_type_id: number;

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
      "CASH",
      "BANK_TRANSFER",
      "CARD_ONLINE",
      "POS_TERMINAL",
      "INSTALLMENT"
    ),
    allowNull: false,
    defaultValue: "CARD_ONLINE",
  })
  payment_method: string;

  @Column({
    type: DataType.ENUM(
      "SUCCESS",
      "PENDING",
      "FAILED",
      "REFUNDED",
      "CANCELLED",
      "REVERSED"
    ),
    allowNull: false,
    defaultValue: "PENDING",
  })
  status: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
  })
  transaction_id: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
  })
  reference_number: string;

  @BelongsTo(() => Student)
  student: Student;

  @BelongsTo(() => PaymentType)
  paymentType: PaymentType;
}
