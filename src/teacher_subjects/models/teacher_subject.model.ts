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
import { Teacher } from "../../teachers/models/teacher.model";
import { Subject } from "../../subjects/models/subject.model";

@Table({
  tableName: "teacher_subjects",
  timestamps: true,
  paranoid: true,
  indexes: [
    {
      unique: true,
      fields: ["teacher_id", "subject_id"],
    },
    {
      fields: ["teacher_id"],
    },
    {
      fields: ["subject_id"],
    },
    {
      fields: ["is_active"],
    },
  ],
})
export class TeacherSubject extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @ForeignKey(() => Teacher)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      min: {
        args: [1],
        msg: "Teacher ID must be a positive number",
      },
    },
  })
  teacher_id: number;

  @ForeignKey(() => Subject)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      min: {
        args: [1],
        msg: "Subject ID must be a positive number",
      },
    },
  })
  subject_id: number;

  @Default(true)
  @AllowNull(false)
  @Column({
    type: DataType.BOOLEAN,
  })
  is_active: boolean;

  @BelongsTo(() => Teacher)
  teacher: Teacher;

  @BelongsTo(() => Subject)
  subject: Subject;
}
