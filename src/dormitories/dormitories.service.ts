import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Op } from "sequelize";
import { Dormitory } from "./models/dormitory.model";
import { DormitoryRoom } from "./models/dormitory-room.model";
import { CreateDormitoryDto } from "./dto/create-dormitory.dto";
import { UpdateDormitoryDto } from "./dto/update-dormitory.dto";
import { FilterDormitoryDto } from "./dto/filter-dormitory.dto";

@Injectable()
export class DormitoriesService {
  constructor(
    @InjectModel(Dormitory)
    private readonly dormitoryModel: typeof Dormitory,
    @InjectModel(DormitoryRoom)
    private readonly dormitoryRoomModel: typeof DormitoryRoom
  ) {}

  async create(createDormitoryDto: CreateDormitoryDto): Promise<Dormitory> {
    if (
      !createDormitoryDto?.name ||
      !createDormitoryDto?.address ||
      !createDormitoryDto?.capacity
    ) {
      throw new BadRequestException(
        "Dormitory name, address and capacity are required"
      );
    }

    const existingDormitory = await this.dormitoryModel.findOne({
      where: { name: createDormitoryDto.name },
    });

    if (existingDormitory) {
      throw new ConflictException("Dormitory with this name already exists");
    }

    const dormitory = await this.dormitoryModel.create({
      name: createDormitoryDto.name,
      address: createDormitoryDto.address,
      capacity: createDormitoryDto.capacity,
      phone: createDormitoryDto.phone,
      email: createDormitoryDto.email,
      description: createDormitoryDto.description,
      location_details: createDormitoryDto.location_details,
      floors_count: createDormitoryDto.floors_count,
      built_year: createDormitoryDto.built_year,
    } as any);

    return this.findOne(dormitory.id);
  }

  async findAll(filterDto: FilterDormitoryDto): Promise<Dormitory[]> {
    const whereClause: any = {};

    if (filterDto.search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${filterDto.search}%` } },
        { address: { [Op.iLike]: `%${filterDto.search}%` } },
      ];
    }

    if (filterDto.min_capacity) {
      whereClause.capacity = {
        ...whereClause.capacity,
        [Op.gte]: filterDto.min_capacity,
      };
    }

    if (filterDto.max_capacity) {
      whereClause.capacity = {
        ...whereClause.capacity,
        [Op.lte]: filterDto.max_capacity,
      };
    }

    if (filterDto.is_active !== undefined) {
      whereClause.is_active = filterDto.is_active;
    }

    if (filterDto.is_available !== undefined) {
      whereClause.is_available = filterDto.is_available;
    }

    const page = filterDto.page || 1;
    const limit = filterDto.limit || 10;
    const offset = (page - 1) * limit;

    return this.dormitoryModel.findAll({
      where: whereClause,
      order: [[filterDto.sort_by || "name", filterDto.sort_order || "ASC"]],
      limit,
      offset,
      include: [
        {
          model: DormitoryRoom,
          attributes: ["id", "room_number", "beds_count"],
        },
      ],
    });
  }

  async findOne(id: number): Promise<Dormitory> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid dormitory ID");
    }

    const dormitory = await this.dormitoryModel.findByPk(id, {
      include: [
        {
          model: DormitoryRoom,
          attributes: [
            "id",
            "room_number",
            "beds_count",
            "floor",
            "is_available",
          ],
        },
      ],
    });

    if (!dormitory) {
      throw new NotFoundException(`Dormitory with ID ${id} not found`);
    }

    return dormitory;
  }

  async update(
    id: number,
    updateDormitoryDto: UpdateDormitoryDto
  ): Promise<Dormitory> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid dormitory ID");
    }

    const dormitory = await this.findOne(id);

    if (updateDormitoryDto.name && updateDormitoryDto.name !== dormitory.name) {
      const existingDormitory = await this.dormitoryModel.findOne({
        where: {
          name: updateDormitoryDto.name,
          id: { [Op.ne]: id },
        },
      });

      if (existingDormitory) {
        throw new ConflictException("Dormitory with this name already exists");
      }
    }

    await dormitory.update(updateDormitoryDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<{ message: string }> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid dormitory ID");
    }

    const dormitory = await this.findOne(id);

    const roomCount = await this.dormitoryRoomModel.count({
      where: { dormitory_id: id },
    });

    if (roomCount > 0) {
      throw new ConflictException(
        "Cannot delete dormitory with existing rooms"
      );
    }

    await dormitory.destroy();
    return { message: "Dormitory deleted successfully" };
  }

  async toggleStatus(id: number): Promise<Dormitory> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid dormitory ID");
    }

    const dormitory = await this.findOne(id);
    await dormitory.update({ is_active: !dormitory.is_active });

    return this.findOne(id);
  }

  async getDormitoryWithRooms(id: number): Promise<Dormitory> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid dormitory ID");
    }

    const dormitory = await this.dormitoryModel.findByPk(id, {
      include: [
        {
          model: DormitoryRoom,
          include: ["students"],
        },
      ],
    });

    if (!dormitory) {
      throw new NotFoundException(`Dormitory with ID ${id} not found`);
    }

    return dormitory;
  }

  async getAvailableDormitories(): Promise<Dormitory[]> {
    return this.dormitoryModel.findAll({
      where: {
        is_active: true,
        is_available: true,
      },
      include: [
        {
          model: DormitoryRoom,
          where: {
            is_available: true,
          },
          required: false,
        },
      ],
      order: [["name", "ASC"]],
    });
  }

  async getDormitoriesStats(): Promise<any> {
    const total = await this.dormitoryModel.count();
    const active = await this.dormitoryModel.count({
      where: { is_active: true },
    });
    const available = await this.dormitoryModel.count({
      where: { is_available: true },
    });

    // Get total capacity and occupied beds
    const dormitories = await this.dormitoryModel.findAll({
      include: [
        {
          model: DormitoryRoom,
          include: ["students"],
        },
      ],
    });

    let totalCapacity = 0;
    let totalOccupied = 0;

    for (const dorm of dormitories) {
      totalCapacity += dorm.capacity;
      const occupied = await dorm.getOccupiedBedsCount();
      totalOccupied += occupied;
    }

    return {
      total,
      active,
      available,
      total_capacity: totalCapacity,
      total_occupied: totalOccupied,
      total_available: totalCapacity - totalOccupied,
      occupancy_rate:
        totalCapacity > 0 ? (totalOccupied / totalCapacity) * 100 : 0,
    };
  }

  async getDormitoryStats(id: number): Promise<any> {
    const dormitory = await this.getDormitoryWithRooms(id);

    // Use the rooms from the included association
    const rooms = dormitory.rooms || [];
    const totalRooms = rooms.length;
    const availableRooms = rooms.filter(
      (room: DormitoryRoom) => room.is_available
    ).length;
    const totalBeds = dormitory.capacity;
    const occupiedBeds = await dormitory.getOccupiedBedsCount();
    const availableBeds = await dormitory.getAvailableBedsCount();

    return {
      dormitory: {
        id: dormitory.id,
        name: dormitory.name,
      },
      rooms: {
        total: totalRooms,
        available: availableRooms,
        occupied: totalRooms - availableRooms,
      },
      beds: {
        total: totalBeds,
        occupied: occupiedBeds,
        available: availableBeds,
        occupancy_rate: totalBeds > 0 ? (occupiedBeds / totalBeds) * 100 : 0,
      },
    };
  }
}
