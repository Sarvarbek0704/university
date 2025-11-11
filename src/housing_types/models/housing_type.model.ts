import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
  Default,
  AllowNull,
} from "sequelize-typescript";
import { InfoStudent } from "../../info_students/models/info_student.model";

@Table({
  tableName: "housing_types",
  timestamps: true,
  paranoid: true,
  indexes: [
    {
      unique: true,
      fields: ["name"],
    },
    {
      fields: ["is_active"],
    },
  ],
})
export class HousingType extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @Column({
    type: DataType.ENUM("DORMITORY", "APARTMENT", "STUDIO", "FAMILY_HOUSING"),
    allowNull: false,
    defaultValue: "DORMITORY",
    validate: {
      notEmpty: {
        msg: "Housing type name cannot be empty",
      },
      isIn: {
        args: [["DORMITORY", "APARTMENT", "STUDIO", "FAMILY_HOUSING"]],
        msg: "Invalid housing type",
      },
    },
  })
  name: string;

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

    @HasMany(() => InfoStudent)
    infoStudents: InfoStudent[];
}
