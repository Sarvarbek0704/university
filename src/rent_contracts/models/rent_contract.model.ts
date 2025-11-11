import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
  Default,
  AllowNull,
  BeforeCreate,
  BeforeUpdate,
} from "sequelize-typescript";
import { Student } from "../../students/models/student.model";

@Table({
  tableName: "rent_contracts",
  timestamps: true,
  paranoid: true,
  indexes: [
    {
      fields: ["student_id"],
    },
    {
      fields: ["status"],
    },
    {
      fields: ["start_date"],
    },
    {
      fields: ["end_date"],
    },
    {
      fields: ["is_active"],
    },
  ],
})
export class RentContract extends Model {
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

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: "Address cannot be empty",
      },
    },
  })
  address: string;

  @Column({
    type: DataType.DECIMAL(8, 2),
    allowNull: false,
    validate: {
      min: {
        args: [0],
        msg: "Monthly rent cannot be negative",
      },
    },
  })
  monthly_rent: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      min: {
        args: [0],
        msg: "University support percent cannot be negative",
      },
      max: {
        args: [100],
        msg: "University support percent cannot exceed 100",
      },
    },
  })
  university_support_percent: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  start_date: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  end_date: Date;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: "Landlord name cannot be empty",
      },
    },
  })
  landlord_name: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: true,
  })
  landlord_phone: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  property_description: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
  })
  contract_number: string;

  @Column({
    type: DataType.ENUM("ACTIVE", "EXPIRED", "TERMINATED", "PENDING"),
    allowNull: false,
    defaultValue: "ACTIVE",
  })
  status: string;

  @Default(true)
  @AllowNull(false)
  @Column({
    type: DataType.BOOLEAN,
  })
  is_active: boolean;

  // Virtual field for calculated support amount
  get university_support_amount(): number {
    return (
      (Number(this.monthly_rent) * Number(this.university_support_percent)) /
      100
    );
  }

  get student_payment_amount(): number {
    return Number(this.monthly_rent) - this.university_support_amount;
  }

  // Associations
  @BelongsTo(() => Student)
  student: Student;

  // Comment out until Installment model is created
  // @HasMany(() => Installment)
  // installments: Installment[];

  @BeforeCreate
  @BeforeUpdate
  static validateDates(contract: RentContract) {
    if (contract.start_date >= contract.end_date) {
      throw new Error("End date must be after start date");
    }
  }

  // Instance methods
  async isActive(): Promise<boolean> {
    const now = new Date();
    return (
      this.status === "ACTIVE" && this.start_date <= now && this.end_date >= now
    );
  }

  async getRemainingDays(): Promise<number> {
    const now = new Date();
    const end = new Date(this.end_date);
    const diffTime = end.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  async getTotalContractValue(): Promise<number> {
    const start = new Date(this.start_date);
    const end = new Date(this.end_date);
    const months =
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth());
    return Number(this.monthly_rent) * months;
  }
}
