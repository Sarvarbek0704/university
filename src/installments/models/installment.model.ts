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
import { RentContract } from "../../rent_contracts/models/rent_contract.model";

@Table({
  tableName: "installments",
  timestamps: true,
  paranoid: true,
  indexes: [
    {
      fields: ["contract_id"],
    },
    {
      fields: ["due_date"],
    },
    {
      fields: ["status"],
    },
    {
      fields: ["created_at"],
    },
  ],
})
export class Installment extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @ForeignKey(() => RentContract)
  @Column({
    type: DataType.BIGINT,
    allowNull: false,
    validate: {
      min: {
        args: [1],
        msg: "Contract ID must be a positive number",
      },
    },
  })
  contract_id: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  due_date: Date;

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

  @Default(0)
  @Column({
    type: DataType.DECIMAL(8, 2),
    allowNull: false,
    validate: {
      min: {
        args: [0],
        msg: "Paid amount cannot be negative",
      },
    },
  })
  paid_amount: number;

  @Column({
    type: DataType.ENUM("PENDING", "PAID", "OVERDUE", "CANCELLED"),
    allowNull: false,
    defaultValue: "PENDING",
  })
  status: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  payment_date: Date;

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
  notes: string;

  // Associations
  @BelongsTo(() => RentContract)
  rentContract: RentContract;

  // Virtual field for remaining amount
  get remaining_amount(): number {
    return Number(this.amount) - Number(this.paid_amount);
  }

  get is_fully_paid(): boolean {
    return Number(this.paid_amount) >= Number(this.amount);
  }

  @BeforeCreate
  @BeforeUpdate
  static validateAmounts(installment: Installment) {
    if (Number(installment.paid_amount) > Number(installment.amount)) {
      throw new Error("Paid amount cannot exceed installment amount");
    }
  }

  // Instance methods
  async isOverdue(): Promise<boolean> {
    const now = new Date();
    return this.status === "PENDING" && this.due_date < now;
  }

  async markAsPaid(
    paidAmount: number,
    paymentDate?: Date,
    notes?: string
  ): Promise<void> {
    const payment = paymentDate || new Date();
    const newPaidAmount = Number(this.paid_amount) + paidAmount;

    if (newPaidAmount > Number(this.amount)) {
      throw new Error("Paid amount cannot exceed installment amount");
    }

    const updates: any = {
      paid_amount: newPaidAmount,
      payment_date: payment,
      notes: notes || this.notes,
    };

    if (newPaidAmount >= Number(this.amount)) {
      updates.status = "PAID";
    } else if (this.status === "OVERDUE") {
      updates.status = "PENDING";
    }

    await this.update(updates);
  }

  async calculateOverdueDays(): Promise<number> {
    if (this.status !== "PENDING" && this.status !== "OVERDUE") {
      return 0;
    }

    const now = new Date();
    const dueDate = new Date(this.due_date);

    if (dueDate >= now) {
      return 0;
    }

    const diffTime = now.getTime() - dueDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
