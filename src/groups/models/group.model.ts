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
import { InfoStudent } from "../../info_students/models/info_student.model";
import { Exam } from "../../exams/models/exam.model";

@Table({
  tableName: "groups",
  timestamps: true,
  paranoid: true,
  indexes: [
    {
      unique: true,
      fields: ["name", "department_id"],
    },
    {
      fields: ["department_id"],
    },
    {
      fields: ["course_number"],
    },
    {
      fields: ["is_active"],
    },
  ],
})
export class Group extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: "Group name cannot be empty",
      },
      len: {
        args: [2, 50],
        msg: "Group name must be between 2 and 50 characters",
      },
    },
  })
  name: string;

  @ForeignKey(() => Department)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      min: {
        args: [1],
        msg: "Department ID must be a positive number",
      },
    },
  })
  department_id: number;

  @Default(1)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      min: {
        args: [1],
        msg: "Course number must be at least 1",
      },
      max: {
        args: [6],
        msg: "Course number cannot exceed 6",
      },
    },
  })
  course_number: number;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description: string;

  @Default(true)
  @AllowNull(false)
  @Column({
    type: DataType.BOOLEAN,
  })
  is_active: boolean;

  @BelongsTo(() => Department)
  department: Department;

  @HasMany(() => InfoStudent)
  infoStudents: InfoStudent[];

  @HasMany(() => Schedule)
  schedules: Schedule[];

  @HasMany(() => Exam)
  exams: Exam[];
}
