import api from './api';

/**
 * Get user profile
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User profile with basic user information
 */
export const getUserProfile = async (userId) => {
  try {
    const response = await api.get(`/api/users/${userId}`);
    // Transform the response to match our simplified model
    const { fullName, email, role, isActive } = response.data;
    return { fullName, email, role, isActive };
  } catch (error) {
    console.error(`Error fetching user ${userId} profile:`, error);
    throw error;
  }
};

/**
 * Update user profile
 * @param {string} userId - User ID
 * @param {Object} userData - Updated user data (only includes fullName)
 * @returns {Promise<Object>} Updated user profile
 */
export const updateUserProfile = async (userId, { fullName }) => {
  try {
    // Only include fields that can be updated
    const response = await api.put(`/api/users/${userId}`, { fullName });
    const { fullName: updatedName, email, role, isActive } = response.data;
    return { fullName: updatedName, email, role, isActive };
  } catch (error) {
    console.error(`Error updating user ${userId} profile:`, error);
    throw error;
  }
};

/**
 * Change user password
 * @param {string} userId - User ID
 * @param {Object} passwordData - Current and new password
 * @param {string} passwordData.currentPassword - Current password
 * @param {string} passwordData.newPassword - New password
 * @returns {Promise<Object>} Success status
 */
export const changePassword = async (userId, { currentPassword, newPassword }) => {
  try {
    const response = await api.post(`/api/users/${userId}/change-password`, {
      currentPassword,
      newPassword,
    });
    return response.data;
  } catch (error) {
    console.error(`Error changing password for user ${userId}:`, error);
    throw error;
  }
};

/**
 * Upload user profile picture
 * @param {string} userId - User ID
 * @param {File} file - Image file
 * @returns {Promise<Object>} Upload result
 */
export const uploadProfilePicture = async (userId, file) => {
  try {
    const formData = new FormData();
    formData.append('profilePicture', file);
    
    const response = await api.post(`/api/users/${userId}/profile-picture`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error uploading profile picture for user ${userId}:`, error);
    throw error;
  }
};

/**
 * Get user notifications
 * @param {string} userId - User ID
 * @param {Object} options - Query options
 * @param {number} options.limit - Number of notifications to fetch
 * @param {boolean} options.unreadOnly - Fetch only unread notifications
 * @returns {Promise<Array>} List of notifications
 */
export const getUserNotifications = async (userId, { limit = 10, unreadOnly = false } = {}) => {
  try {
    const response = await api.get(`/api/users/${userId}/notifications`, {
      params: { limit, unreadOnly },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching notifications for user ${userId}:`, error);
    throw error;
  }
};

/**
 * Mark notification as read
 * @param {string} userId - User ID
 * @param {string} notificationId - Notification ID
 * @returns {Promise<Object>} Updated notification
 */
export const markNotificationAsRead = async (userId, notificationId) => {
  try {
    const response = await api.patch(`/api/users/${userId}/notifications/${notificationId}/read`);
    return response.data;
  } catch (error) {
    console.error(`Error marking notification ${notificationId} as read:`, error);
    throw error;
  }
};

export default {
  getUserProfile,
  updateUserProfile,
  changePassword,
  uploadProfilePicture,
  getUserNotifications,
  markNotificationAsRead,
};
