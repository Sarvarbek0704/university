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
} from "sequelize-typescript";
import { Department } from "../../departments/models/department.model";
import { Schedule } from "../../schedules/models/schedule.model";
import { TeacherSubject } from "../../teacher_subjects/models/teacher_subject.model";
import { Prerequisite } from "../../prerequisites/models/prerequisite.model";
import { FailedSubject } from "../../failed_subjects/models/failed_subject.model";
import { CourseWork } from "../../course_works/models/course_work.model";
import { Exam } from "../../exams/models/exam.model";

@Table({
  tableName: "subjects",
  timestamps: true,
  paranoid: true,
  indexes: [
    {
      fields: ["department_id"],
    },
    {
      fields: ["semester_number"],
    },
    {
      fields: ["is_active"],
    },
  ],
})
export class Subject extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: "Subject name cannot be empty",
      },
      len: {
        args: [2, 100],
        msg: "Subject name must be between 2 and 100 characters",
      },
    },
  })
  name: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    validate: {
      min: {
        args: [1],
        msg: "Credit must be at least 1",
      },
      max: {
        args: [10],
        msg: "Credit cannot exceed 10",
      },
    },
  })
  credit: number;

  @ForeignKey(() => Department)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  department_id: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    validate: {
      min: {
        args: [1],
        msg: "Semester number must be at least 1",
      },
      max: {
        args: [8],
        msg: "Semester number cannot exceed 8",
      },
    },
  })
  semester_number: number;

  @Default(true)
  @AllowNull(false)
  @Column({
    type: DataType.BOOLEAN,
  })
  is_active: boolean;

  @BelongsTo(() => Department)
  department: Department;

  @HasMany(() => TeacherSubject)
  teacherSubjects: TeacherSubject[];

  @HasMany(() => Schedule)
  schedules: Schedule[];

  @HasMany(() => Prerequisite)
  prerequisires: Prerequisite[];

  @HasMany(() => FailedSubject)
  failedSubjects: FailedSubject[];

  @HasMany(() => CourseWork)
  courseWorks: CourseWork[];

  @HasMany(() => Exam)
  exams: Exam[];
}
