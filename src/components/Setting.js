import React, { useState, useEffect } from 'react';
import AppLayout from './Layout';
import { Eye } from 'lucide-react';
import Cookies from 'js-cookie';
import axios from 'axios';

const SettingsPage = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('Account');
  const [notifications, setNotifications] = useState({
    emailNotify: false,
  });
  
  // User info states
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  
  // Password states
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Status states
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Get user details from cookies
    setUsername(Cookies.get('username') || '');
    setEmail(Cookies.get('email') || '');
  }, []);

  useEffect(() => {
    const fetchNotificationStatus = async () => {
      const token = Cookies.get('token');
      const user_guid = Cookies.get('guid');

      if (!email || !user_guid) return;
  
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_CYBEDEFENDER_AI_URL}cyberdefender/notify-status`,
          {
            params: {
              user_guid,
              email,
            },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
  
        const { notify } = response.data;
        setNotifications({ emailNotify: notify });
      } catch (error) {
        console.error('Error fetching notification status:', error);
        setNotifications({ emailNotify: false }); // Default fallback
      }
    };
  
    fetchNotificationStatus();
  }, [email]); // Re-run when email changes
  

  const handleNotificationChange = async () => {
    const token = Cookies.get('token')
    const newEmailValue = !notifications.emailNotify;
    

    setNotifications({ emailNotify: newEmailValue });

    try {
      await axios.post(
        `${process.env.REACT_APP_CYBEDEFENDER_AI_URL}/cybedefender/notify`, // change to your backend URL
        {
          user_guid: Cookies.get('guid'),
          email: email,
          email_notify: newEmailValue ? 1 : 0,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log('Notification preference updated');
    } catch (error) {
      console.error('Error updating notification preference:', error);
    }
  };

  const togglePasswordVisibility = (field) => {
    switch (field) {
      case 'old':
        setShowOldPassword(!showOldPassword);
        break;
      case 'new':
        setShowNewPassword(!showNewPassword);
        break;
      case 'confirm':
        setShowConfirmPassword(!showConfirmPassword);
        break;
      default:
        break;
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validate passwords
    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match');
      return;
    }

    // Password validation regex
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!regex.test(newPassword)) {
      setError('Password must be at least 8 characters long, include 1 uppercase letter, 1 number, and 1 special character.');
      return;
    }

    try {
      setLoading(true);
      const token = Cookies.get('token');
      
      if (!token) {
        setError('You are not authenticated. Please log in again.');
        return;
      }

      const response = await axios.post(
        `${process.env.REACT_APP_CYBEDEFENDER_AI_URL}/cybedefender/change-password`,
        {
          oldPassword,
          newPassword
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.status === 200) {
        setSuccess('Password changed successfully');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError(response.data.message || 'Failed to change password');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred while changing password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout onLogout={onLogout}>
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm">
        {/* Settings Navigation */}
        <div className="border-b">
          <div className="flex space-x-1 p-2">
            <button
              className={`px-4 py-2 rounded-md ${
                activeTab === 'Account'
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('Account')}
            >
              Account
            </button>
            <button
              className={`px-4 py-2 rounded-md ${
                activeTab === 'Password'
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('Password')}
            >
              Change Password
            </button>
            <button
              className={`px-4 py-2 rounded-md ${
                activeTab === 'Notifications'
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('Notifications')}
            >
              Notifications
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {activeTab === 'Account' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Account Information</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Username</label>
                  <div className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50">
                    {username}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <div className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50">
                    {email}
                  </div>
                </div>
                
                <p className="text-sm text-gray-500">
                  Contact support if you need to update your email address or username.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'Password' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Change Password</h2>
              
              <form onSubmit={handleChangePassword} className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}
                
                {success && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                    {success}
                  </div>
                )}
                
                <div>
                  <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <div className="relative mt-1">
                    <input
                      id="oldPassword"
                      type={showOldPassword ? 'text' : 'password'}
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('old')}
                      className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <div className="relative mt-1">
                    <input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('new')}
                      className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative mt-1">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirm')}
                      className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out"
                  >
                    {loading ? 'Changing Password...' : 'Change Password'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'Notifications' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Notification Preferences</h2>

              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Email Notifications</h3>
                      <p className="text-sm text-gray-500">
                        Receive timely emails with important information and reminders, keeping you
                        always informed.
                      </p>
                    </div>
                    <button
                      className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                        notifications.emailNotify ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                      onClick={handleNotificationChange}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                          notifications.emailNotify ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default SettingsPage;