import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from "@nestjs/swagger";
import { NotificationsService } from "./notifications.service";
import { CreateNotificationDto } from "./dto/create-notification.dto";
import { UpdateNotificationDto } from "./dto/update-notification.dto";
import { FilterNotificationsDto } from "./dto/filter-notifications.dto";
import { BulkNotificationDto } from "./dto/bulk-notification.dto";
import { NotificationStatsDto } from "./dto/notification-stats.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AdminGuard } from "../auth/guards/admin.guard";

@ApiTags("notifications")
@ApiBearerAuth("JWT-auth")
@Controller("notifications")
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Create a new notification" })
  @ApiResponse({
    status: 201,
    description: "Notification created successfully",
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  async create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.create(createNotificationDto);
  }

  @Post("bulk")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Send notifications to multiple users" })
  @ApiResponse({
    status: 201,
    description: "Bulk notifications sent successfully",
  })
  async createBulk(@Body() bulkNotificationDto: BulkNotificationDto) {
    return this.notificationsService.createBulk(bulkNotificationDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all notifications with filtering" })
  @ApiResponse({ status: 200, description: "Return all notifications" })
  async findAll(@Query() filterDto: FilterNotificationsDto) {
    return this.notificationsService.findAll(filterDto);
  }

  @Get("stats")
  @ApiOperation({ summary: "Get notifications statistics" })
  @ApiResponse({ status: 200, description: "Return notifications statistics" })
  async getStats(@Query() statsDto: NotificationStatsDto) {
    return this.notificationsService.getStats(statsDto);
  }

  @Get("user/:userId")
  @ApiOperation({ summary: "Get user notifications" })
  @ApiParam({ name: "userId", type: Number, description: "User ID" })
  @ApiResponse({ status: 200, description: "Return user notifications" })
  async findByUser(@Param("userId", ParseIntPipe) userId: number) {
    return this.notificationsService.findByUser(userId);
  }

  @Get("user/:userId/unread")
  @ApiOperation({ summary: "Get user unread notifications" })
  @ApiParam({ name: "userId", type: Number, description: "User ID" })
  @ApiResponse({ status: 200, description: "Return user unread notifications" })
  async findUnreadByUser(@Param("userId", ParseIntPipe) userId: number) {
    return this.notificationsService.findUnreadByUser(userId);
  }

  @Get("user/:userId/unread-count")
  @ApiOperation({ summary: "Get user unread notifications count" })
  @ApiParam({ name: "userId", type: Number, description: "User ID" })
  @ApiResponse({ status: 200, description: "Return unread count" })
  async getUnreadCount(@Param("userId", ParseIntPipe) userId: number) {
    return this.notificationsService.getUnreadCount(userId);
  }

  @Get("scheduled")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Get scheduled notifications" })
  @ApiResponse({ status: 200, description: "Return scheduled notifications" })
  async findScheduled() {
    return this.notificationsService.findScheduled();
  }

  @Get("expired")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Get expired notifications" })
  @ApiResponse({ status: 200, description: "Return expired notifications" })
  async findExpired() {
    return this.notificationsService.findExpired();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get notification by ID" })
  @ApiParam({ name: "id", type: Number, description: "Notification ID" })
  @ApiResponse({ status: 200, description: "Return notification" })
  @ApiResponse({ status: 404, description: "Notification not found" })
  async findOne(@Param("id", ParseIntPipe) id: number) {
    return this.notificationsService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Update notification" })
  @ApiParam({ name: "id", type: Number, description: "Notification ID" })
  @ApiResponse({
    status: 200,
    description: "Notification updated successfully",
  })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateNotificationDto: UpdateNotificationDto
  ) {
    return this.notificationsService.update(id, updateNotificationDto);
  }

  @Patch(":id/read")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Mark notification as read" })
  @ApiParam({ name: "id", type: Number, description: "Notification ID" })
  @ApiResponse({ status: 200, description: "Notification marked as read" })
  async markAsRead(@Param("id", ParseIntPipe) id: number) {
    return this.notificationsService.markAsRead(id);
  }

  @Patch(":id/unread")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Mark notification as unread" })
  @ApiParam({ name: "id", type: Number, description: "Notification ID" })
  @ApiResponse({ status: 200, description: "Notification marked as unread" })
  async markAsUnread(@Param("id", ParseIntPipe) id: number) {
    return this.notificationsService.markAsUnread(id);
  }

  @Patch(":id/archive")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Archive notification" })
  @ApiParam({ name: "id", type: Number, description: "Notification ID" })
  @ApiResponse({ status: 200, description: "Notification archived" })
  async archive(@Param("id", ParseIntPipe) id: number) {
    return this.notificationsService.archive(id);
  }

  @Patch(":id/unarchive")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Unarchive notification" })
  @ApiParam({ name: "id", type: Number, description: "Notification ID" })
  @ApiResponse({ status: 200, description: "Notification unarchived" })
  async unarchive(@Param("id", ParseIntPipe) id: number) {
    return this.notificationsService.unarchive(id);
  }

  @Post("user/:userId/read-all")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Mark all user notifications as read" })
  @ApiParam({ name: "userId", type: Number, description: "User ID" })
  @ApiResponse({ status: 200, description: "All notifications marked as read" })
  async markAllAsRead(@Param("userId", ParseIntPipe) userId: number) {
    return this.notificationsService.markAllAsRead(userId);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Delete notification" })
  @ApiParam({ name: "id", type: Number, description: "Notification ID" })
  @ApiResponse({
    status: 200,
    description: "Notification deleted successfully",
  })
  async remove(@Param("id", ParseIntPipe) id: number) {
    return this.notificationsService.remove(id);
  }

  @Delete("user/:userId/expired")
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: "Delete expired notifications for user" })
  @ApiParam({ name: "userId", type: Number, description: "User ID" })
  @ApiResponse({ status: 200, description: "Expired notifications deleted" })
  async removeExpired(@Param("userId", ParseIntPipe) userId: number) {
    return this.notificationsService.removeExpired(userId);
  }
}
