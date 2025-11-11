import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
  Default,
  AllowNull,
} from "sequelize-typescript";
import { Payment } from "../../payments/models/payment.model";

@Table({
  tableName: "payment_types",
  timestamps: true,
  paranoid: true,
  indexes: [
    {
      unique: true,
      fields: ["name"],
    },
    {
      fields: ["is_active"],
    },
  ],
})
export class PaymentType extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @Column({
    type: DataType.ENUM(
      "TUITION_FEE",
      "DORMITORY_FEE",
      "APPLICATION_FEE",
      "LIBRARY_FEE",
      "FINE_LATE",
      "EXAM_FEE",
      "GRADUATION_FEE"
    ),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: "Payment type name cannot be empty",
      },
      isIn: {
        args: [
          [
            "TUITION_FEE",
            "DORMITORY_FEE",
            "APPLICATION_FEE",
            "LIBRARY_FEE",
            "FINE_LATE",
            "EXAM_FEE",
            "GRADUATION_FEE",
          ],
        ],
        msg: "Invalid payment type",
      },
    },
  })
  name: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  description: string;

  @Default(true)
  @AllowNull(false)
  @Column({
    type: DataType.BOOLEAN,
  })
  is_active: boolean;

  @HasMany(() => Payment)
  payments: Payment[];
}
