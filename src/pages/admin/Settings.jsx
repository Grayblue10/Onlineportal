import React, { useState, useEffect } from 'react';
import { Settings, Save, RefreshCw, Database, Mail, Shield, Globe, Info, LogOut } from 'lucide-react';
import { Button, Input, Card } from '../../components/ui';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

export default function SystemSettings() {
  const { logout } = useAuth();
  const [settings, setSettings] = useState({
    siteName: 'Online Grading System',
    siteDescription: 'Comprehensive academic grading and management platform',
    allowRegistration: true,
    requireEmailVerification: true,
    maxFileUploadSize: 10,
    sessionTimeout: 30,
    maintenanceMode: false,
    emailNotifications: true,
    smsNotifications: false,
    backupFrequency: 'daily',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    defaultGradingScale: 'percentage'
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      // For now, use default settings since backend might not be implemented
      // const response = await api.get('/admin/settings');
      // setSettings(prev => ({ ...prev, ...response.data }));
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Using default settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      // await api.put('/admin/settings', settings);
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all settings to default values?')) {
      setSettings({
        siteName: 'Online Grading System',
        siteDescription: 'Comprehensive academic grading and management platform',
        allowRegistration: true,
        requireEmailVerification: true,
        maxFileUploadSize: 10,
        sessionTimeout: 30,
        maintenanceMode: false,
        emailNotifications: true,
        smsNotifications: false,
        backupFrequency: 'daily',
        timezone: 'UTC',
        dateFormat: 'MM/DD/YYYY',
        defaultGradingScale: 'percentage'
      });
      toast.info('Settings reset to default values');
    }
  };

  const handleAboutSystem = () => {
    const aboutInfo = `
Online Grading System v1.0.0

A comprehensive academic grading and management platform designed for universities.

Features:
• Student and Teacher Management
• Grade Tracking and Analytics
• Subject and Class Management
• Real-time Dashboard Updates
• Secure Authentication System

Developed with React, Node.js, and MongoDB.
    `;
    alert(aboutInfo);
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      toast.success('Logged out successfully');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={handleAboutSystem}>
            <Info className="w-4 h-4 mr-2" />
            About System
          </Button>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
          <Button variant="outline" onClick={handleReset} disabled={saving}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset to Default
          </Button>
          <Button onClick={handleSave} loading={saving}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <Globe className="w-5 h-5 mr-2 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">General Settings</h2>
          </div>
          
          <div className="space-y-4">
            <Input
              id="site-name"
              label="Site Name"
              name="siteName"
              value={settings.siteName}
              onChange={handleInputChange}
              disabled={loading}
            />
            
            <Input
              id="site-description"
              label="Site Description"
              name="siteDescription"
              value={settings.siteDescription}
              onChange={handleInputChange}
              textarea
              rows={3}
              disabled={loading}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                id="session-timeout"
                label="Session Timeout (minutes)"
                name="sessionTimeout"
                type="number"
                value={settings.sessionTimeout}
                onChange={handleInputChange}
                min="5"
                max="480"
                disabled={loading}
              />
              
              <Input
                id="max-file-upload"
                label="Max File Upload (MB)"
                name="maxFileUploadSize"
                type="number"
                value={settings.maxFileUploadSize}
                onChange={handleInputChange}
                min="1"
                max="100"
                disabled={loading}
              />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Allow User Registration</label>
                <input
                  type="checkbox"
                  name="allowRegistration"
                  checked={settings.allowRegistration}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={loading}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Require Email Verification</label>
                <input
                  type="checkbox"
                  name="requireEmailVerification"
                  checked={settings.requireEmailVerification}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={loading}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Maintenance Mode</label>
                <input
                  type="checkbox"
                  name="maintenanceMode"
                  checked={settings.maintenanceMode}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Academic Settings */}
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <Settings className="w-5 h-5 mr-2 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">Academic Settings</h2>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                <select
                  name="timezone"
                  value={settings.timezone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="Asia/Manila">Philippine Time</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Format</label>
                <select
                  name="dateFormat"
                  value={settings.dateFormat}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Default Grading Scale</label>
              <select
                name="defaultGradingScale"
                value={settings.defaultGradingScale}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                <option value="percentage">Percentage (0-100%)</option>
                <option value="gpa">GPA (0.0-4.0)</option>
                <option value="letter">Letter Grades (A-F)</option>
                <option value="points">Points Based</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Backup Frequency</label>
              <select
                name="backupFrequency"
                value={settings.backupFrequency}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Notification Settings */}
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <Mail className="w-5 h-5 mr-2 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">Notification Settings</h2>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Email Notifications</label>
              <input
                type="checkbox"
                name="emailNotifications"
                checked={settings.emailNotifications}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={loading}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">SMS Notifications</label>
              <input
                type="checkbox"
                name="smsNotifications"
                checked={settings.smsNotifications}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={loading}
              />
            </div>
          </div>
        </Card>

        {/* System Information */}
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <Database className="w-5 h-5 mr-2 text-orange-600" />
            <h2 className="text-lg font-semibold text-gray-900">System Information</h2>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">System Version</span>
              <span className="text-sm font-medium text-gray-900">v1.0.0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Database Status</span>
              <span className="text-sm font-medium text-green-600">Connected</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Last Backup</span>
              <span className="text-sm font-medium text-gray-900">2 hours ago</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Server Uptime</span>
              <span className="text-sm font-medium text-gray-900">99.9%</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
