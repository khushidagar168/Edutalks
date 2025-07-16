import React, { useEffect, useState } from 'react';
import { Save, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import axios from "../services/axios"

// // Mock axios for demo - replace with your actual axios import
// const axios = {
//   get: (url) => Promise.resolve({ data: { email: 'admin@example.com', phone: '+1234567890', location: 'New York, NY' } }),
//   put: (url, data) => new Promise(resolve => setTimeout(() => resolve({ data: 'success' }), 1000))
// };

const AdminSiteSettings = () => {
  const [settings, setSettings] = useState({
    email: '',
    phone: '',
    location: '',
    facebook: '',
    twitter: '',
    instagram: '',
    linkedin: '',
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [originalSettings, setOriginalSettings] = useState({});

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/site-settings');
        if (res.data) {
          setSettings(res.data);
          setOriginalSettings(res.data);
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
        setErrors({ general: 'Failed to load settings. Please try again.' });
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const validateField = (name, value) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = 'Please enter a valid email address';
        } else {
          delete newErrors.email;
        }
        break;
      case 'phone':
        if (value && !/^[\+]?[0-9\s\-\(\)]{10,}$/.test(value)) {
          newErrors.phone = 'Please enter a valid phone number';
        } else {
          delete newErrors.phone;
        }
        break;
      case 'facebook':
      case 'twitter':
      case 'instagram':
      case 'linkedin':
        if (value && !/(https?:\/\/)|(www\.)/.test(value) && !value.startsWith('/')) {
          newErrors[name] = 'Please enter a valid URL or username';
        } else {
          delete newErrors[name];
        }
        break;
      default:
        break;
    }
    
    setErrors(newErrors);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
    setHasChanges(true);
    setSuccessMessage('');
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields before submission
    const hasValidationErrors = Object.keys(errors).length > 0;
    if (hasValidationErrors) {
      return;
    }

    try {
      setSaving(true);
      setErrors({});
      await axios.put('/site-settings', settings);
      setSuccessMessage('Settings updated successfully!');
      setHasChanges(false);
      setOriginalSettings(settings);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Failed to update settings:', error);
      setErrors({ general: 'Failed to update settings. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSettings(originalSettings);
    setHasChanges(false);
    setErrors({});
    setSuccessMessage('');
  };

  const getFieldIcon = (field) => {
    const icons = {
      email: Mail,
      phone: Phone,
      location: MapPin,
      facebook: Facebook,
      twitter: Twitter,
      instagram: Instagram,
      linkedin: Linkedin,
    };
    return icons[field] || Mail;
  };

  const getFieldLabel = (field) => {
    const labels = {
      email: 'Email Address',
      phone: 'Phone Number',
      location: 'Location',
      facebook: 'Facebook URL',
      twitter: 'Twitter URL',
      instagram: 'Instagram URL',
      linkedin: 'LinkedIn URL',
    };
    return labels[field] || field.charAt(0).toUpperCase() + field.slice(1);
  };

  const getFieldPlaceholder = (field) => {
    const placeholders = {
      email: 'admin@yoursite.com',
      phone: '+1 (555) 123-4567',
      location: 'City, State/Country',
      facebook: 'https://facebook.com/yourpage',
      twitter: 'https://twitter.com/yourhandle',
      instagram: 'https://instagram.com/yourhandle',
      linkedin: 'https://linkedin.com/company/yourcompany',
    };
    return placeholders[field] || `Enter ${field}`;
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Loader className="w-8 h-8 animate-spin text-indigo-600" />
          <span className="ml-2 text-gray-600">Loading settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
          <h1 className="text-2xl font-bold text-white">Site Settings</h1>
          <p className="text-indigo-100 mt-1">Configure your site's contact information and social media links</p>
        </div>

        {/* Form Content */}
        <div className="p-6">
          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-green-800">{successMessage}</span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <span className="text-red-800">{errors.general}</span>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {/* Contact Information Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['email', 'phone', 'location'].map((field) => {
                  const Icon = getFieldIcon(field);
                  return (
                    <div key={field} className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        {getFieldLabel(field)}
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Icon className="w-5 h-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          name={field}
                          value={settings[field] || ''}
                          onChange={handleChange}
                          placeholder={getFieldPlaceholder(field)}
                          className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                            errors[field] ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                          }`}
                        />
                      </div>
                      {errors[field] && (
                        <p className="text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors[field]}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Social Media Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                Social Media Links
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['facebook', 'twitter', 'instagram', 'linkedin'].map((field) => {
                  const Icon = getFieldIcon(field);
                  return (
                    <div key={field} className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        {getFieldLabel(field)}
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Icon className="w-5 h-5 text-gray-400" />
                        </div>
                        <input
                          type="url"
                          name={field}
                          value={settings[field] || ''}
                          onChange={handleChange}
                          placeholder={getFieldPlaceholder(field)}
                          className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                            errors[field] ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                          }`}
                        />
                      </div>
                      {errors[field] && (
                        <p className="text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors[field]}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-4">
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={saving || Object.keys(errors).length > 0 || !hasChanges}
                  className="flex items-center px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? (
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {saving ? 'Saving...' : 'Save Settings'}
                </button>
                
                {hasChanges && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                  >
                    Reset Changes
                  </button>
                )}
              </div>
              
              {hasChanges && (
                <span className="text-sm text-amber-600 font-medium">
                  You have unsaved changes
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSiteSettings;