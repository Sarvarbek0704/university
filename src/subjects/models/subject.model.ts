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
// import { TeacherSubject } from "../../teacher-subjects/models/teacher-subject.model";
import { Schedule } from "../../schedules/models/schedule.model";
import { TeacherSubject } from "../../teacher_subjects/models/teacher_subject.mdoel";
// import { CourseWork } from "../../course-works/models/course-work.model";
// import { Exam } from "../../exams/models/exam.model";

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

  // Associations
  @BelongsTo(() => Department)
  department: Department;

  @HasMany(() => TeacherSubject)
  teacherSubjects: TeacherSubject[];

  @HasMany(() => Schedule)
  schedules: Schedule[];

  //   @HasMany(() => CourseWork)
  //   courseWorks: CourseWork[];

  //   @HasMany(() => Exam)
  //   exams: Exam[];
}
