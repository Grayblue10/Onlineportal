import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import Form from '../forms/Form';
import FormSelect from '../forms/FormSelect';
import Button from '../ui/Button';
import { updateUserPreferences } from '../../services/userService';

const themeOptions = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' }
];

const languageOptions = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' }
];

const fontSizeOptions = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' }
];

const AppearanceForm = ({ initialPreferences = {}, onSuccess }) => {
  const defaultValues = {
    theme: initialPreferences.theme || 'system',
    language: initialPreferences.language || 'en',
    fontSize: initialPreferences.fontSize || 'medium',
    compactMode: initialPreferences.compactMode || false,
    highContrast: initialPreferences.highContrast || false
  };

  const handleSubmit = async (data) => {
    try {
      await updateUserPreferences(data);
      toast.success('Appearance preferences saved successfully');
      if (onSuccess) onSuccess(data);
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error(error.response?.data?.message || 'Failed to save preferences');
      throw error;
    }
  };

  return (
    <Form
      schema="appearance"
      onSubmit={handleSubmit}
      submitText="Save Preferences"
      defaultValues={defaultValues}
      className="space-y-6"
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Theme</h2>
          <p className="text-sm text-gray-500">
            Customize how the application looks on your device.
          </p>
          
          <div className="mt-4 space-y-6">
            <FormSelect
              name="theme"
              label="Color Theme"
              options={themeOptions}
              placeholder="Select theme"
              description="Choose between light and dark themes, or use your system settings"
            />

            <FormSelect
              name="language"
              label="Language"
              options={languageOptions}
              placeholder="Select language"
              description="Select your preferred language"
            />

            <FormSelect
              name="fontSize"
              label="Font Size"
              options={fontSizeOptions}
              placeholder="Select font size"
              description="Adjust the size of text throughout the application"
            />
          </div>
        </div>
      </div>
    </Form>
  );
};

export default AppearanceForm;
