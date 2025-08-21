import React from 'react';
import { toast } from 'react-hot-toast';
import Form from '../forms/Form';
import FormSwitch from '../forms/FormSwitch';
import Button from '../ui/Button';
import { updateUserPreferences } from '../../services/userService';

const NotificationsForm = ({ initialPreferences = {}, onSuccess }) => {
  const defaultValues = {
    emailNotifications: initialPreferences.emailNotifications ?? true,
    pushNotifications: initialPreferences.pushNotifications ?? true,
    assignmentReminders: initialPreferences.assignmentReminders ?? true,
    gradeUpdates: initialPreferences.gradeUpdates ?? true,
    announcementEmails: initialPreferences.announcementEmails ?? true,
    marketingEmails: initialPreferences.marketingEmails ?? false
  };

  const handleSubmit = async (data) => {
    try {
      await updateUserPreferences({ notifications: data });
      toast.success('Notification preferences saved successfully');
      if (onSuccess) onSuccess(data);
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      toast.error(error.response?.data?.message || 'Failed to save notification preferences');
      throw error;
    }
  };

  return (
    <Form
      schema="notifications"
      onSubmit={handleSubmit}
      submitText="Save Notification Preferences"
      defaultValues={defaultValues}
      className="space-y-6"
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Email Notifications</h2>
          <p className="text-sm text-gray-500 mb-4">
            Control what email notifications you receive.
          </p>
          
          <div className="space-y-4">
            <FormSwitch
              name="emailNotifications"
              label="Email Notifications"
              description="Receive email notifications for important updates"
            />
            
            <FormSwitch
              name="assignmentReminders"
              label="Assignment Reminders"
              description="Get reminders for upcoming assignment due dates"
              disabled={!defaultValues.emailNotifications}
            />
            
            <FormSwitch
              name="gradeUpdates"
              label="Grade Updates"
              description="Receive notifications when new grades are posted"
              disabled={!defaultValues.emailNotifications}
            />
            
            <FormSwitch
              name="announcementEmails"
              label="Announcements"
              description="Get emails about important announcements"
              disabled={!defaultValues.emailNotifications}
            />
            
            <FormSwitch
              name="marketingEmails"
              label="Marketing Communications"
              description="Receive promotional emails and updates"
              disabled={!defaultValues.emailNotifications}
            />
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Push Notifications</h2>
          <p className="text-sm text-gray-500 mb-4">
            Control push notifications on your devices.
          </p>
          
          <div className="space-y-4">
            <FormSwitch
              name="pushNotifications"
              label="Push Notifications"
              description="Enable push notifications on your devices"
            />
          </div>
        </div>
      </div>
    </Form>
  );
};

export default NotificationsForm;
