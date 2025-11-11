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
import { Faculty } from "../../faculties/models/faculty.model";
import { Teacher } from "../../teachers/models/teacher.model";
import { Student } from "../../students/models/student.model";

@Table({
  tableName: "departments",
  timestamps: true,
  paranoid: true,
  indexes: [
    {
      unique: true,
      fields: ["name", "faculty_id"],
    },
    {
      fields: ["faculty_id"],
    },
    {
      fields: ["is_active"],
    },
  ],
})
export class Department extends Model {
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
        msg: "Department name cannot be empty",
      },
      len: {
        args: [2, 100],
        msg: "Department name must be between 2 and 100 characters",
      },
    },
  })
  name: string;

  @Column({
    type: DataType.STRING(10),
    allowNull: true,
    validate: {
      len: {
        args: [1, 10],
        msg: "Department code must be between 1 and 10 characters",
      },
    },
  })
  code: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description: string;

  @ForeignKey(() => Faculty)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      min: {
        args: [1],
        msg: "Faculty ID must be a positive number",
      },
    },
  })
  faculty_id: number;

  @Default(true)
  @AllowNull(false)
  @Column({
    type: DataType.BOOLEAN,
  })
  is_active: boolean;

  @BelongsTo(() => Faculty)
  faculty: Faculty;

  @HasMany(() => Teacher)
  teachers: Teacher[];

  @HasMany(() => Student)
  students: Student[];
}
