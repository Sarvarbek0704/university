import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Op } from "sequelize";
import { PaymentType } from "./models/payment_type.model";
import { Payment } from "../payments/models/payment.model";
import { Student } from "../students/models/student.model";
import { CreatePaymentTypeDto } from "./dto/create-payment_type.dto";
import { UpdatePaymentTypeDto } from "./dto/update-payment_type.dto";
import { FilterPaymentTypeDto } from "./dto/filter-payment-type.dto";

@Injectable()
export class PaymentTypesService {
  constructor(
    @InjectModel(PaymentType)
    private readonly paymentTypeModel: typeof PaymentType
  ) {}

  async create(
    createPaymentTypeDto: CreatePaymentTypeDto
  ): Promise<PaymentType> {
    if (!createPaymentTypeDto?.name) {
      throw new BadRequestException("Payment type name is required");
    }

    const existingPaymentType = await this.paymentTypeModel.findOne({
      where: { name: createPaymentTypeDto.name },
    });

    if (existingPaymentType) {
      throw new ConflictException("Payment type with this name already exists");
    }

    const paymentType = await this.paymentTypeModel.create({
      name: createPaymentTypeDto.name,
      description: createPaymentTypeDto.description,
    } as any);

    return this.findOne(paymentType.id);
  }

  async findAll(filterDto: FilterPaymentTypeDto): Promise<PaymentType[]> {
    const whereClause: any = {};

    if (filterDto.search) {
      whereClause.name = {
        [Op.iLike]: `%${filterDto.search}%`,
      };
    }

    if (filterDto.is_active !== undefined) {
      whereClause.is_active = filterDto.is_active;
    }

    const page = filterDto.page || 1;
    const limit = filterDto.limit || 10;
    const offset = (page - 1) * limit;

    return this.paymentTypeModel.findAll({
      where: whereClause,
      order: [[filterDto.sort_by || "name", filterDto.sort_order || "ASC"]],
      limit,
      offset,
    });
  }

  async findOne(id: number): Promise<PaymentType> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid payment type ID");
    }

    const paymentType = await this.paymentTypeModel.findByPk(id);

    if (!paymentType) {
      throw new NotFoundException(`Payment type with ID ${id} not found`);
    }

    return paymentType;
  }

  async update(
    id: number,
    updatePaymentTypeDto: UpdatePaymentTypeDto
  ): Promise<PaymentType> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid payment type ID");
    }

    const paymentType = await this.findOne(id);

    if (
      updatePaymentTypeDto.name &&
      updatePaymentTypeDto.name !== paymentType.name
    ) {
      const existingPaymentType = await this.paymentTypeModel.findOne({
        where: {
          name: updatePaymentTypeDto.name,
          id: { [Op.ne]: id },
        },
      });

      if (existingPaymentType) {
        throw new ConflictException(
          "Payment type with this name already exists"
        );
      }
    }

    await paymentType.update(updatePaymentTypeDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<{ message: string }> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid payment type ID");
    }

    const paymentType = await this.findOne(id);

    const paymentCount = await paymentType.$count("payments");
    if (paymentCount > 0) {
      throw new ConflictException(
        "Cannot delete payment type with associated payments"
      );
    }

    await paymentType.destroy();
    return { message: "Payment type deleted successfully" };
  }

  async toggleStatus(id: number): Promise<PaymentType> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid payment type ID");
    }

    const paymentType = await this.findOne(id);
    await paymentType.update({ is_active: !paymentType.is_active });

    return this.findOne(id);
  }

  async getPaymentTypeWithPayments(id: number): Promise<PaymentType> {
    if (!id || isNaN(id)) {
      throw new BadRequestException("Invalid payment type ID");
    }

    const paymentType = await this.paymentTypeModel.findByPk(id, {
      include: [
        {
          model: Payment,
          include: [
            {
              model: Student,
              attributes: ["id", "full_name", "email"],
            },
          ],
          attributes: [
            "id",
            "amount",
            "payment_date",
            "status",
            "payment_method",
          ],
        },
      ],
    });

    if (!paymentType) {
      throw new NotFoundException(`Payment type with ID ${id} not found`);
    }

    return paymentType;
  }

  async getActivePaymentTypes(): Promise<PaymentType[]> {
    return this.paymentTypeModel.findAll({
      where: { is_active: true },
      order: [["name", "ASC"]],
    });
  }

  async getPaymentTypesCount(): Promise<{ total: number; active: number }> {
    const total = await this.paymentTypeModel.count();
    const active = await this.paymentTypeModel.count({
      where: { is_active: true },
    });

    return { total, active };
  }

  async getPaymentTypeStats(id: number): Promise<any> {
    const paymentType = await this.getPaymentTypeWithPayments(id);

    const totalPayments = paymentType.payments.length;
    const successfulPayments = paymentType.payments.filter(
      (p) => p.status === "SUCCESS"
    ).length;
    const totalAmount = paymentType.payments
      .filter((p) => p.status === "SUCCESS")
      .reduce((sum, payment) => sum + parseFloat(payment.amount.toString()), 0);

    const methodStats = paymentType.payments.reduce((acc, payment) => {
      const method = payment.payment_method;
      if (!acc[method]) {
        acc[method] = { count: 0, amount: 0 };
      }
      acc[method].count++;
      if (payment.status === "SUCCESS") {
        acc[method].amount += parseFloat(payment.amount.toString());
      }
      return acc;
    }, {});

    return {
      payment_type: {
        id: paymentType.id,
        name: paymentType.name,
        description: paymentType.description,
      },
      stats: {
        total_payments: totalPayments,
        successful_payments: successfulPayments,
        success_rate:
          totalPayments > 0 ? (successfulPayments / totalPayments) * 100 : 0,
        total_amount: totalAmount,
        average_amount:
          successfulPayments > 0 ? totalAmount / successfulPayments : 0,
        by_method: methodStats,
      },
    };
  }
}
