import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
  Default,
  AllowNull,
  BeforeUpdate,
  BeforeCreate,
} from "sequelize-typescript";
import { Schedule } from "../../schedules/models/schedule.model";

@Table({
  tableName: "classrooms",
  timestamps: true,
  paranoid: true,
  indexes: [
    {
      unique: true,
      fields: ["building_number", "room_number"],
    },
    {
      fields: ["building_number"],
    },
    {
      fields: ["type"],
    },
    {
      fields: ["capacity"],
    },
    {
      fields: ["is_active"],
    },
    {
      fields: ["is_available"],
    },
    {
      fields: ["has_projector"],
    },
    {
      fields: ["has_computers"],
    },
  ],
})
export class Classroom extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      min: {
        args: [1],
        msg: "Building number must be at least 1",
      },
      max: {
        args: [20],
        msg: "Building number cannot exceed 20",
      },
    },
  })
  building_number: number;

  @Column({
    type: DataType.BIGINT,
    allowNull: false,
    validate: {
      min: {
        args: [1],
        msg: "Room number must be at least 1",
      },
    },
  })
  room_number: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    validate: {
      min: {
        args: [1],
        msg: "Capacity must be at least 1",
      },
      max: {
        args: [500],
        msg: "Capacity cannot exceed 500",
      },
    },
  })
  capacity: number;

  @Column({
    type: DataType.ENUM(
      "lecture_hall",
      "standart_class",
      "seminar_room",
      "computer_lab",
      "science_lab",
      "workshop",
      "conference_room"
    ),
    allowNull: false,
    defaultValue: "standart_class",
    validate: {
      notEmpty: {
        msg: "Classroom type cannot be empty",
      },
      isIn: {
        args: [
          [
            "lecture_hall",
            "standart_class",
            "seminar_room",
            "computer_lab",
            "science_lab",
            "workshop",
            "conference_room",
          ],
        ],
        msg: "Invalid classroom type",
      },
    },
  })
  type: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  equipment: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  location_description: string;

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
  })
  has_air_conditioning: boolean;

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
  })
  has_projector: boolean;

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
  })
  has_computers: boolean;

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
  })
  is_accessible: boolean;

  @Default(true)
  @AllowNull(false)
  @Column({
    type: DataType.BOOLEAN,
  })
  is_active: boolean;

  @Default(true)
  @AllowNull(false)
  @Column({
    type: DataType.BOOLEAN,
  })
  is_available: boolean;

  get full_identifier(): string {
    return `B${this.building_number}-R${this.room_number}`;
  }

  @HasMany(() => Schedule)
  schedules: Schedule[];


  @BeforeUpdate
  @BeforeCreate
  static validateClassroomData(classroom: Classroom) {
    if (classroom.building_number < 1 || classroom.building_number > 20) {
      throw new Error("Building number must be between 1 and 20");
    }
    if (
      classroom.capacity &&
      (classroom.capacity < 1 || classroom.capacity > 500)
    ) {
      throw new Error("Capacity must be between 1 and 500");
    }
  }

  async isAvailableForTimeSlot(
    date: string,
    startTime: string,
    endTime: string,
    dayOfWeek?: number
  ): Promise<boolean> {
    const whereClause: any = {
      classroom_id: this.id,
    };

    if (date) {
      whereClause.date = date;
    } else if (dayOfWeek) {
      whereClause.day_of_week = dayOfWeek;
    }

    const conflictingSchedules = await Schedule.count({
      where: whereClause,
    });

    return conflictingSchedules === 0;
  }
}
