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

@Table({
  tableName: "student_credits",
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ["student_id", "semester_id"],
    },
    {
      fields: ["student_id"],
    },
    {
      fields: ["semester_id"],
    },
    {
      fields: ["status"],
    },
  ],
})
export class StudentCredit extends Model {
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

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  semester_id: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  total_credits: number;

  @Column({
    type: DataType.DECIMAL(3, 2),
    allowNull: false,
    defaultValue: 0.0,
  })
  gpa: number;

  @Default("IN_PROGRESS")
  @Column({
    type: DataType.ENUM("COMPLETED", "IN_PROGRESS", "FAILED", "WITHDRAWN"),
    allowNull: false,
  })
  status: string;

  @BelongsTo(() => Student)
  student: Student;

  get isCompleted(): boolean {
    return this.status === "COMPLETED";
  }

  get isFailed(): boolean {
    return this.status === "FAILED";
  }

  get isInProgress(): boolean {
    return this.status === "IN_PROGRESS";
  }

  get gpaLetter(): string {
    if (this.gpa >= 3.7) return "A";
    if (this.gpa >= 3.3) return "A-";
    if (this.gpa >= 3.0) return "B+";
    if (this.gpa >= 2.7) return "B";
    if (this.gpa >= 2.3) return "B-";
    if (this.gpa >= 2.0) return "C+";
    if (this.gpa >= 1.7) return "C";
    if (this.gpa >= 1.3) return "C-";
    if (this.gpa >= 1.0) return "D+";
    return "F";
  }
}
