import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Op } from "sequelize";
import { Notification } from "./models/notification.model";
import { CreateNotificationDto } from "./dto/create-notification.dto";
import { UpdateNotificationDto } from "./dto/update-notification.dto";
import { FilterNotificationsDto } from "./dto/filter-notifications.dto";
import { BulkNotificationDto } from "./dto/bulk-notification.dto";
import { NotificationStatsDto } from "./dto/notification-stats.dto";

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification)
    private readonly notificationModel: typeof Notification
  ) {}

  async create(
    createNotificationDto: CreateNotificationDto
  ): Promise<Notification> {
    try {
      const notificationData: any = {
        ...createNotificationDto,
        sent_at: createNotificationDto.send_immediately
          ? new Date()
          : new Date(createNotificationDto.scheduled_for),
      };

      if (createNotificationDto.expires_at) {
        notificationData.expires_at = new Date(
          createNotificationDto.expires_at
        );
      }

      return await this.notificationModel.create(notificationData);
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to create notification: ${error.message}`
      );
    }
  }

  async createBulk(bulkNotificationDto: BulkNotificationDto): Promise<{
    success: number;
    failed: number;
    total: number;
    errors: string[];
  }> {
    const results = {
      success: 0,
      failed: 0,
      total: bulkNotificationDto.recipients.length,
      errors: [] as string[],
    };

    const notifications = bulkNotificationDto.recipients.map((recipient) => ({
      user_id: recipient.user_id,
      user_type: recipient.user_type,
      title: bulkNotificationDto.title,
      message: bulkNotificationDto.message,
      type: bulkNotificationDto.type,
      priority: bulkNotificationDto.priority || "MEDIUM",
      category: bulkNotificationDto.category,
      metadata: bulkNotificationDto.metadata,
      sent_at: new Date(),
    }));

    try {
      const created = await this.notificationModel.bulkCreate(notifications);
      results.success = created.length;
    } catch (error) {
      results.failed = results.total;
      results.errors.push(`Bulk creation failed: ${error.message}`);
    }

    return results;
  }

  async findAll(filterDto: FilterNotificationsDto): Promise<{
    data: Notification[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const whereClause: any = {};

    if (filterDto.user_id) {
      whereClause.user_id = filterDto.user_id;
    }

    if (filterDto.user_type) {
      whereClause.user_type = filterDto.user_type;
    }

    if (filterDto.type) {
      whereClause.type = filterDto.type;
    }

    if (filterDto.priority) {
      whereClause.priority = filterDto.priority;
    }

    if (filterDto.category) {
      whereClause.category = filterDto.category;
    }

    if (filterDto.is_read !== undefined) {
      whereClause.is_read = filterDto.is_read;
    }

    if (filterDto.is_archived !== undefined) {
      whereClause.is_archived = filterDto.is_archived;
    }

    if (filterDto.date_from && filterDto.date_to) {
      whereClause.sent_at = {
        [Op.between]: [
          new Date(filterDto.date_from),
          new Date(filterDto.date_to),
        ],
      };
    }

    const page = filterDto.page || 1;
    const limit = filterDto.limit || 20;
    const offset = (page - 1) * limit;

    const { count, rows } = await this.notificationModel.findAndCountAll({
      where: whereClause,
      order: [[filterDto.sort_by || "sent_at", filterDto.sort_order || "DESC"]],
      limit,
      offset,
    });

    return {
      data: rows,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit),
      },
    };
  }

  async findOne(id: number): Promise<Notification> {
    const notification = await this.notificationModel.findByPk(id);
    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
    return notification;
  }

  async findByUser(userId: number): Promise<Notification[]> {
    return this.notificationModel.findAll({
      where: { user_id: userId },
      order: [["sent_at", "DESC"]],
    });
  }

  async findUnreadByUser(userId: number): Promise<Notification[]> {
    return this.notificationModel.findAll({
      where: {
        user_id: userId,
        is_read: false,
        is_archived: false,
        [Op.or]: [
          { expires_at: null },
          { expires_at: { [Op.gt]: new Date() } },
        ],
      },
      order: [["sent_at", "DESC"]],
    });
  }

  async getUnreadCount(userId: number): Promise<{ count: number }> {
    const count = await this.notificationModel.count({
      where: {
        user_id: userId,
        is_read: false,
        is_archived: false,
        [Op.or]: [
          { expires_at: null },
          { expires_at: { [Op.gt]: new Date() } },
        ],
      },
    });

    return { count };
  }

  async findScheduled(): Promise<Notification[]> {
    return this.notificationModel.findAll({
      where: {
        sent_at: { [Op.gt]: new Date() },
      },
      order: [["sent_at", "ASC"]],
    });
  }

  async findExpired(): Promise<Notification[]> {
    return this.notificationModel.findAll({
      where: {
        expires_at: { [Op.lt]: new Date() },
      },
      order: [["expires_at", "ASC"]],
    });
  }

  async update(
    id: number,
    updateNotificationDto: UpdateNotificationDto
  ): Promise<Notification> {
    const notification = await this.findOne(id);
    await notification.update(updateNotificationDto);
    return this.findOne(id);
  }

  async markAsRead(id: number): Promise<Notification> {
    const notification = await this.findOne(id);
    notification.markAsRead();
    await notification.save();
    return this.findOne(id);
  }

  async markAsUnread(id: number): Promise<Notification> {
    const notification = await this.findOne(id);
    notification.markAsUnread();
    await notification.save();
    return this.findOne(id);
  }

  async archive(id: number): Promise<Notification> {
    const notification = await this.findOne(id);
    notification.archive();
    await notification.save();
    return this.findOne(id);
  }

  async unarchive(id: number): Promise<Notification> {
    const notification = await this.findOne(id);
    notification.unarchive();
    await notification.save();
    return this.findOne(id);
  }

  async markAllAsRead(userId: number): Promise<{ updated: number }> {
    const [updatedCount] = await this.notificationModel.update(
      {
        is_read: true,
        read_at: new Date(),
      },
      {
        where: {
          user_id: userId,
          is_read: false,
        },
      }
    );

    return { updated: updatedCount };
  }

  async remove(id: number): Promise<{ message: string }> {
    const notification = await this.findOne(id);
    await notification.destroy();
    return { message: "Notification deleted successfully" };
  }

  async removeExpired(userId: number): Promise<{ deleted: number }> {
    const deletedCount = await this.notificationModel.destroy({
      where: {
        user_id: userId,
        expires_at: { [Op.lt]: new Date() },
      },
    });

    return { deleted: deletedCount };
  }

  async getStats(statsDto: NotificationStatsDto): Promise<any> {
    const whereClause: any = {};

    if (statsDto.user_id) {
      whereClause.user_id = statsDto.user_id;
    }

    if (statsDto.user_type) {
      whereClause.user_type = statsDto.user_type;
    }

    if (statsDto.start_date && statsDto.end_date) {
      whereClause.sent_at = {
        [Op.between]: [
          new Date(statsDto.start_date),
          new Date(statsDto.end_date),
        ],
      };
    }

    const total = await this.notificationModel.count({ where: whereClause });
    const read = await this.notificationModel.count({
      where: { ...whereClause, is_read: true },
    });
    const unread = await this.notificationModel.count({
      where: { ...whereClause, is_read: false },
    });
    const archived = await this.notificationModel.count({
      where: { ...whereClause, is_archived: true },
    });
    const expired = await this.notificationModel.count({
      where: {
        ...whereClause,
        expires_at: { [Op.lt]: new Date() },
      },
    });

    // Type statistics
    const typeStats = await this.notificationModel.findAll({
      where: whereClause,
      attributes: [
        "type",
        [
          this.notificationModel.sequelize!.fn(
            "COUNT",
            this.notificationModel.sequelize!.col("id")
          ),
          "count",
        ],
      ],
      group: ["type"],
      raw: true,
    });

    // Priority statistics
    const priorityStats = await this.notificationModel.findAll({
      where: whereClause,
      attributes: [
        "priority",
        [
          this.notificationModel.sequelize!.fn(
            "COUNT",
            this.notificationModel.sequelize!.col("id")
          ),
          "count",
        ],
      ],
      group: ["priority"],
      raw: true,
    });

    // User type statistics
    const userTypeStats = await this.notificationModel.findAll({
      where: whereClause,
      attributes: [
        "user_type",
        [
          this.notificationModel.sequelize!.fn(
            "COUNT",
            this.notificationModel.sequelize!.col("id")
          ),
          "count",
        ],
      ],
      group: ["user_type"],
      raw: true,
    });

    // Daily/weekly/monthly statistics
    let periodStats = [];
    if (statsDto.period) {
      let groupBy: string;
      let dateFormat: string;

      switch (statsDto.period) {
        case "daily":
          groupBy = "DATE(sent_at)";
          dateFormat = "%Y-%m-%d";
          break;
        case "weekly":
          groupBy = "YEARWEEK(sent_at)";
          dateFormat = "%x-%v";
          break;
        case "monthly":
          groupBy = 'DATE_FORMAT(sent_at, "%Y-%m")';
          dateFormat = "%Y-%m";
          break;
        case "yearly":
          groupBy = "YEAR(sent_at)";
          dateFormat = "%Y";
          break;
        default:
          groupBy = "DATE(sent_at)";
          dateFormat = "%Y-%m-%d";
      }

      periodStats = await this.notificationModel.sequelize!.query(
        `
        SELECT 
          DATE_FORMAT(sent_at, '${dateFormat}') as period,
          COUNT(*) as count,
          SUM(CASE WHEN is_read = true THEN 1 ELSE 0 END) as read_count,
          SUM(CASE WHEN is_read = false THEN 1 ELSE 0 END) as unread_count
        FROM notifications 
        ${Object.keys(whereClause).length > 0 ? "WHERE ..." : ""}
        GROUP BY period
        ORDER BY period DESC
        LIMIT 30
      `,
        {
          type: "SELECT",
          replacements: whereClause,
        }
      );
    }

    return {
      summary: {
        total,
        read,
        unread,
        archived,
        expired,
        read_rate: total > 0 ? ((read / total) * 100).toFixed(2) : 0,
      },
      by_type: typeStats,
      by_priority: priorityStats,
      by_user_type: userTypeStats,
      by_period: periodStats,
      time_range: {
        start_date: statsDto.start_date,
        end_date: statsDto.end_date,
        period: statsDto.period,
      },
    };
  }

  async cleanupExpired(): Promise<{ deleted: number }> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const deletedCount = await this.notificationModel.destroy({
      where: {
        expires_at: { [Op.lt]: thirtyDaysAgo },
        is_archived: true,
      },
    });

    return { deleted: deletedCount };
  }

  async sendScheduledNotifications(): Promise<{ sent: number }> {
    const now = new Date();

    const [sentCount] = await this.notificationModel.update(
      {
        sent_at: now,
      },
      {
        where: {
          sent_at: { [Op.lte]: now },
          is_read: false,
        },
      }
    );

    return { sent: sentCount };
  }

  async getUserNotificationPreferences(
    userId: number,
    userType: string
  ): Promise<any> {
    // This would typically come from a user preferences table
    // For now, returning default preferences
    const defaultPreferences = {
      email_enabled: true,
      push_enabled: true,
      sms_enabled: false,
      categories: {
        SYSTEM: true,
        ACADEMIC: true,
        FINANCIAL: true,
        ATTENDANCE: true,
        EXAM: true,
        LIBRARY: false,
        INTERNSHIP: true,
        COURSE_WORK: true,
        DEADLINE: true,
        REMINDER: true,
        SECURITY: true,
        OTHER: false,
      },
      quiet_hours: {
        enabled: false,
        start: "22:00",
        end: "08:00",
      },
    };

    return defaultPreferences;
  }
}
