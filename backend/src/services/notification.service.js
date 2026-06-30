// src/services/notification.service.js

const Notification = require('../models/Notification');
const AppError = require('../errors/AppError');

/**
 * Creates a new notification
 */
const createNotification = async ({ businessId, userId, title, message, type, entityType, entityId, metadata = {} }) => {
  if (!userId) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[NotificationService] Skipped creating notification because userId is missing. Title:', title);
    }
    return null;
  }

  try {
    const notification = await Notification.create({
      userId,
      businessId: businessId || null,
      title,
      message,
      type,
      entityType: entityType || null,
      entityId: entityId || null,
      metadata,
    });
    return notification.toJSON();
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[NotificationService] Failed to create notification:', err.message);
    }
    // Do not throw to avoid breaking main business logic flows
    return null;
  }
};

/**
 * Retrieves notifications for a user with pagination
 */
const getNotifications = async (userId, { page = 1, limit = 20 } = {}) => {
  const safePage = Math.max(parseInt(page) || 1, 1);
  const safeLimit = Math.min(Math.max(parseInt(limit) || 20, 1), 50);
  const skip = (safePage - 1) * safeLimit;

  const [notifications, total] = await Promise.all([
    Notification.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(safeLimit),
    Notification.countDocuments({ userId }),
  ]);

  return {
    notifications: notifications.map(n => n.toJSON()),
    pagination: {
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit),
    }
  };
};

/**
 * Gets the count of unread notifications for a user
 */
const getUnreadCount = async (userId) => {
  const count = await Notification.countDocuments({ userId, isRead: false });
  return { count };
};

/**
 * Marks a specific notification as read
 */
const markAsRead = async (userId, notificationId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    throw new AppError('Notification not found', 404);
  }

  return notification.toJSON();
};

/**
 * Marks all notifications as read for a user
 */
const markAllAsRead = async (userId) => {
  await Notification.updateMany(
    { userId, isRead: false },
    { isRead: true }
  );
  return { success: true };
};

/**
 * Deletes a specific notification
 */
const deleteNotification = async (userId, notificationId) => {
  const notification = await Notification.findOneAndDelete({ _id: notificationId, userId });
  if (!notification) {
    throw new AppError('Notification not found', 404);
  }
  return { success: true };
};

module.exports = {
  createNotification,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
