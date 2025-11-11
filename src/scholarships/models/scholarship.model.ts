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
  HasMany,
} from "sequelize-typescript";
import { Student } from "../../students/models/student.model";
import { ScholarshipTransaction } from "../../scolarship_transactions/models/scolarship_transaction.model";

@Table({
  tableName: "scholarships",
  timestamps: true,
  paranoid: true,
  indexes: [
    {
      fields: ["student_id"],
    },
    {
      fields: ["scholarship_type"],
    },
    {
      fields: ["month"],
    },
    {
      fields: ["year"],
    },
    {
      fields: ["is_active"],
    },
  ],
})
export class Scholarship extends Model {
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
    type: DataType.ENUM(
      "STATE_STANDARD",
      "PRESIDENTIAL",
      "NAMED_SCHOLARSHIP",
      "SOCIAL_SUPPORT",
      "PRIVATE_FUNDED",
      "RESEARCH_GRANT"
    ),
    allowNull: false,
    defaultValue: "STATE_STANDARD",
    validate: {
      isIn: {
        args: [
          [
            "STATE_STANDARD",
            "PRESIDENTIAL",
            "NAMED_SCHOLARSHIP",
            "SOCIAL_SUPPORT",
            "PRIVATE_FUNDED",
            "RESEARCH_GRANT",
          ],
        ],
        msg: "Invalid scholarship type",
      },
    },
  })
  scholarship_type: string;

  @Column({
    type: DataType.DECIMAL(8, 2),
    allowNull: true,
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
  month: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  year: Date;

  @Default(true)
  @AllowNull(false)
  @Column({
    type: DataType.BOOLEAN,
  })
  is_active: boolean;

  @BelongsTo(() => Student)
  student: Student;

  @HasMany(() => ScholarshipTransaction)
  transactions: ScholarshipTransaction[];

  @BeforeUpdate
  @BeforeCreate
  static async setDefaultAmount(scholarship: Scholarship) {
    // Agar amount belgilanmagan bo'lsa, scholarship turiga qarab standart miqdorni belgilash
    if (!scholarship.amount) {
      scholarship.amount = Scholarship.getDefaultAmount(
        scholarship.scholarship_type
      );
    }
  }

  static getDefaultAmount(scholarshipType: string): number {
    const defaultAmounts: { [key: string]: number } = {
      STATE_STANDARD: 500000,
      PRESIDENTIAL: 1000000,
      NAMED_SCHOLARSHIP: 750000,
      SOCIAL_SUPPORT: 300000,
      PRIVATE_FUNDED: 600000,
      RESEARCH_GRANT: 800000,
    };

    return defaultAmounts[scholarshipType] || 500000;
  }

  get formattedAmount(): string {
    return `$${this.amount?.toFixed(2) || "0.00"}`;
  }

  get monthYear(): string {
    const month = this.month.getMonth() + 1;
    const year = this.year.getFullYear();
    return `${year}-${month.toString().padStart(2, "0")}`;
  }
}
