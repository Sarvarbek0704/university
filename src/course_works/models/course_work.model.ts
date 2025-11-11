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
import { Subject } from "../../subjects/models/subject.model";

@Table({
  tableName: "course_works",
  timestamps: true,
})
export class CourseWork extends Model {
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

  @ForeignKey(() => Subject)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  subject_id: number;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  title: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description: string;

  @Column({
    type: DataType.STRING(500),
    allowNull: true,
  })
  file_url: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  submission_date: Date;

  @Column({
    type: DataType.ENUM("A", "B", "C", "D", "E", "F", "PENDING"),
    allowNull: false,
    defaultValue: "PENDING",
  })
  grade: string;

  @Default(0)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  score: number;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  feedback: string;

  @BelongsTo(() => Student)
  student: Student;

  @BelongsTo(() => Subject)
  subject: Subject;

  get isGraded(): boolean {
    return this.grade !== "PENDING";
  }

  get isPassed(): boolean {
    return ["A", "B", "C", "D"].includes(this.grade);
  }

  get isExcellent(): boolean {
    return this.grade === "A";
  }

  get daysUntilDue(): number {
    const today = new Date();
    const dueDate = new Date(this.submission_date);
    const diffTime = dueDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get isOverdue(): boolean {
    return new Date() > new Date(this.submission_date) && !this.isGraded;
  }
}
