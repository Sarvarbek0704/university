import {
  Table,
  Column,
  Model,
  DataType,
  Default,
  AllowNull,
  BeforeCreate,
  BeforeUpdate,
  Index,
} from "sequelize-typescript";

@Table({
  tableName: "notifications",
  timestamps: true,
  indexes: [
    {
      fields: ["user_id"],
    },
    {
      fields: ["type"],
    },
    {
      fields: ["is_read"],
    },
    {
      fields: ["priority"],
    },
    {
      fields: ["sent_at"],
    },
    {
      fields: ["expires_at"],
    },
  ],
})
export class Notification extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  user_id: number;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  user_type: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  title: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  message: string;

  @Column({
    type: DataType.ENUM(
      "SYSTEM",
      "ACADEMIC",
      "FINANCIAL",
      "ATTENDANCE",
      "EXAM",
      "LIBRARY",
      "INTERNSHIP",
      "COURSE_WORK",
      "DEADLINE",
      "REMINDER",
      "SECURITY",
      "OTHER"
    ),
    allowNull: false,
    defaultValue: "SYSTEM",
  })
  type: string;

  @Column({
    type: DataType.ENUM("LOW", "MEDIUM", "HIGH", "URGENT"),
    allowNull: false,
    defaultValue: "MEDIUM",
  })
  priority: string;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  metadata: any;

  @Column({
    type: DataType.STRING(500),
    allowNull: true,
  })
  action_url: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
  })
  category: string;

  @Default(() => new Date())
  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  sent_at: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  expires_at: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  read_at: Date | null;

  @Default(false)
  @AllowNull(false)
  @Column({
    type: DataType.BOOLEAN,
  })
  is_read: boolean;

  @Default(false)
  @AllowNull(false)
  @Column({
    type: DataType.BOOLEAN,
  })
  is_archived: boolean;

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
  })
  template_id: string;

  @BeforeCreate
  static setDefaultExpiration(notification: Notification) {
    if (!notification.expires_at) {
      // Default: 30 days from sent date
      const expiresAt = new Date(notification.sent_at);
      expiresAt.setDate(expiresAt.getDate() + 30);
      notification.expires_at = expiresAt;
    }
  }

  @BeforeUpdate
  static updateReadStatus(notification: Notification) {
    if (
      notification.changed("is_read") &&
      notification.is_read &&
      !notification.read_at
    ) {
      notification.read_at = new Date();
    }
  }

  // Getters
  get isExpired(): boolean {
    return this.expires_at ? new Date() > this.expires_at : false;
  }

  get isActive(): boolean {
    return !this.is_read && !this.is_archived && !this.isExpired;
  }

  get daysSinceSent(): number {
    const now = new Date();
    const sent = new Date(this.sent_at);
    const diffTime = now.getTime() - sent.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  get urgencyLevel(): string {
    if (this.isExpired) return "EXPIRED";
    if (this.priority === "URGENT") return "URGENT";
    if (this.daysSinceSent <= 1) return "RECENT";
    if (this.daysSinceSent <= 7) return "NEW";
    return "OLD";
  }

  get formattedSentDate(): string {
    return this.sent_at.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  markAsRead(): void {
    this.is_read = true;
    this.read_at = new Date();
  }

  markAsUnread(): void {
    this.is_read = false;
    this.read_at = null;
  }

  archive(): void {
    this.is_archived = true;
  }

  unarchive(): void {
    this.is_archived = false;
  }
}
