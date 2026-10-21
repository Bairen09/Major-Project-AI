// src/controllers/notification.controller.js

const notificationService = require('../services/notification.service');

const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page, limit, status, search } = req.query;
    
    const result = await notificationService.getNotifications(userId, { page, limit, status, search });
    
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (err) {
    next(err);
  }
};

const getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await notificationService.getUnreadCount(userId);
    
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (err) {
    next(err);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const notificationId = req.params.id;
    
    const result = await notificationService.markAsRead(userId, notificationId);
    
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (err) {
    next(err);
  }
};

const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await notificationService.markAllAsRead(userId);
    
    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (err) {
    next(err);
  }
};

const deleteNotification = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const notificationId = req.params.id;
    
    await notificationService.deleteNotification(userId, notificationId);
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
