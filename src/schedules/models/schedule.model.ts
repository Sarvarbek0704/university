import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  AllowNull,
  Default,
} from "sequelize-typescript";
import { Classroom } from "../../classrooms/models/classroom.model";
// import { Subject } from "../../subjects/models/subject.model";
import { Teacher } from "../../teachers/models/teacher.model";
// import { Group } from "../../groups/models/group.model";

@Table({
  tableName: "schedules",
  timestamps: true,
  paranoid: true,
  indexes: [
    {
      fields: ["classroom_id"],
    },
    {
      fields: ["day_of_week"],
    },
    {
      fields: ["group_id"],
    },
    {
      fields: ["teacher_id"],
    },
  ],
})
export class Schedule extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  //   @ForeignKey(() => Group)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  group_id: number;

  //   @ForeignKey(() => Subject)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  subject_id: number;

  @ForeignKey(() => Teacher)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  teacher_id: number;

  @ForeignKey(() => Classroom)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  classroom_id: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 7,
    },
  })
  day_of_week: number;

  @Column({
    type: DataType.TIME,
    allowNull: false,
  })
  start_time: string;

  @Column({
    type: DataType.TIME,
    allowNull: false,
  })
  end_time: string;

  @Default(true)
  @AllowNull(false)
  @Column({
    type: DataType.BOOLEAN,
  })
  is_active: boolean;

  // Associations
  @BelongsTo(() => Classroom)
  classroom: Classroom;

  //   @BelongsTo(() => Subject)
  //   subject: Subject;

  @BelongsTo(() => Teacher)
  teacher: Teacher;

  //   @BelongsTo(() => Group)
  //   group: Group;
}
