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
  tableName: "internships",
  timestamps: true,
})
export class Internship extends Model {
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
    type: DataType.STRING(255),
    allowNull: false,
  })
  organization_name: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  position: string;

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
    allowNull: true,
  })
  supervisor_name: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  supervisor_contact: string;

  @Default("IN_PROGRESS")
  @Column({
    type: DataType.ENUM("IN_PROGRESS", "COMPLETED", "TERMINATED"),
    allowNull: false,
  })
  status: string;

  @Column({
    type: DataType.ENUM("EXCELLENT", "GOOD", "SATISFACTORY", "FAIL"),
    allowNull: true,
  })
  grade: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  feedback: string;

  @BelongsTo(() => Student)
  student: Student;

  get isCompleted(): boolean {
    return this.status === "COMPLETED";
  }

  get isInProgress(): boolean {
    return this.status === "IN_PROGRESS";
  }

  get durationDays(): number {
    const start = new Date(this.start_date);
    const end = new Date(this.end_date);
    const diffTime = end.getTime() - start.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get isActive(): boolean {
    const today = new Date();
    return (
      today >= new Date(this.start_date) && today <= new Date(this.end_date)
    );
  }
}
