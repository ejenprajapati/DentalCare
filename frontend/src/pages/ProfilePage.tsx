// components/UserProfile.tsx
import React, { useState, useEffect } from 'react';
import { User, UpdateProfileData, UpdatePasswordData } from '../types/user';
import { getUserProfile, updateUserProfile, updateUserPassword, deleteUserAccount } from '../services/userApi';
import '../components/UserProfile.css';
import { useNavigate } from 'react-router-dom';

const UserProfile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formData, setFormData] = useState<UpdateProfileData>({});
  const [passwordData, setPasswordData] = useState<UpdatePasswordData>({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [showPasswordChange, setShowPasswordChange] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  // Add states for password visibility
  const [showCurrentPassword, setShowCurrentPassword] = useState<boolean>(false);
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  
  const navigate = useNavigate();
  const API_BASE_URL = 'http://127.0.0.1:8000';

  useEffect(() => {
    console.log('Profile picture URL:', user?.profile_picture_url);
}, [user]);
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const userData = await getUserProfile();
      setUser(userData);
      setFormData({
        first_name: userData.first_name,
        last_name: userData.last_name,
        phone_number: userData.phone_number || '',
        gender: userData.gender || '',
      });
      setLoading(false);
    } catch (err: any) {
      setError('Failed to load profile: ' + (err.response?.data?.detail || err.message));
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value,
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({
        ...formData,
        profile_picture: file,
      });
      
      // Create a preview URL
      const objectUrl = URL.createObjectURL(file);
      setImagePreview(objectUrl);
      
      // Clean up the preview URL when component unmounts
      return () => URL.revokeObjectURL(objectUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const updatedUser = await updateUserProfile(formData);
      setUser(updatedUser);
      setIsEditing(false);
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError('Failed to update profile: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      setError('New passwords do not match');
      return;
    }
    
    try {
      setLoading(true);
      await updateUserPassword(passwordData);
      setShowPasswordChange(false);
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
      setSuccessMessage('Password updated successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError('Failed to update password: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      await deleteUserAccount();
      navigate('/login');
    } catch (err: any) {
      setError('Failed to delete account: ' + (err.response?.data?.detail || err.message));
      setLoading(false);
    }
  };

  if (loading && !user) {
    return <div className="loading">Loading profile...</div>;
  }

  if (error && !user) {
    return <div className="error">{error}</div>;
  }

  const profileImage = imagePreview || (user?.profile_picture_url !== "none" ? `${API_BASE_URL}${user?.profile_picture_url}` : null);
  const userFullName = user ? `${user.first_name} ${user.last_name}` : '';

  return (
    <div className="profile-container">
      {successMessage && <div className="success-message">{successMessage}</div>}
      {error && <div className="error-message">{error}</div>}
      
      <div className="profile-header">
        <div className="profile-avatar">
          {profileImage ? (
            <img src={profileImage} alt="Profile" />
          ) : (
            <div className="profile-avatar-placeholder">
              {userFullName ? userFullName.charAt(0).toUpperCase() : '?'}
            </div>
          )}
          {isEditing && (
            <div className="profile-avatar-upload">
              <label htmlFor="profile-picture" className="upload-button">
                Change Photo
              </label>
              <input 
                type="file" 
                id="profile-picture" 
                name="profile_picture" 
                accept="image/*" 
                onChange={handleImageChange}
                className="file-input" 
              />
            </div>
          )}
        </div>
        
        <div className="profile-title">
          <h1>{userFullName || 'User Profile'}</h1>
          <p>
            {user?.role
                ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
                : 'No Role'}
          </p>
          <p>{user?.email}</p>
        </div>
      </div>
      
      {!isEditing ? (
        <div className="profile-details">
          <div className="detail-row">
            <span className="detail-label">Username:</span>
            <span className="detail-value">{user?.username}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">First Name:</span>
            <span className="detail-value">{user?.first_name}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Last Name:</span>
            <span className="detail-value">{user?.last_name}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Email:</span>
            <span className="detail-value">{user?.email}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Phone Number:</span>
            <span className="detail-value">{user?.phone_number || 'Not provided'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Gender:</span>
            <span className="detail-value">
              {user?.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : 'Not specified'}
            </span>
          </div>
          
          {/* Conditional rendering for Patient or Dentist specific fields */}
          {user?.role === 'patient' && user.patient && (
            <>
              <div className="detail-row">
                <span className="detail-label">Emergency Contact:</span>
                <span className="detail-value">{(user as any).patient.emergency_contact || 'Not provided'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Allergies:</span>
                <span className="detail-value">{(user as any).patient.allergies || 'None'}</span>
              </div>
            </>
          )}
          
          {user?.role === 'dentist' && (user as any).dentist && (
            <>
              <div className="detail-row">
                <span className="detail-label">Specialization:</span>
                <span className="detail-value">{(user as any).dentist.specialization || 'Not specified'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Experience:</span>
                <span className="detail-value">{(user as any).dentist.experience || 'Not specified'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Qualification:</span>
                <span className="detail-value">{(user as any).dentist.qualification || 'Not specified'}</span>
              </div>
            </>
          )}
          
          <div className="profile-actions">
            <button 
              className="btn edit-btn" 
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </button>
            <button 
              className="btn password-btn" 
              onClick={() => setShowPasswordChange(true)}
            >
              Change Password
            </button>
            <button 
              className="btn delete-btn" 
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete Account
            </button>
          </div>
        </div>
      ) : (
        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="first_name">First Name</label>
            <input
              id="first_name"
              name="first_name"
              type="text"
              value={formData.first_name || ''}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="last_name">Last Name</label>
            <input
              id="last_name"
              name="last_name"
              type="text"
              value={formData.last_name || ''}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="phone_number">Phone Number</label>
            <input
              id="phone_number"
              name="phone_number"
              type="tel"
              value={formData.phone_number || ''}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="gender">Gender</label>
            <select
              id="gender"
              name="gender"
              value={formData.gender || ''}
              onChange={handleInputChange}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div className="form-actions">
            <button type="submit" className="btn save-btn" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button 
              type="button" 
              className="btn cancel-btn" 
              onClick={() => {
                setIsEditing(false);
                setError(null);
                if (imagePreview) {
                  URL.revokeObjectURL(imagePreview);
                  setImagePreview(null);
                }
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Password Change Modal */}
      {showPasswordChange && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Change Password</h2>
            <form onSubmit={handlePasswordSubmit}>
              <div className="form-group">
                <label htmlFor="current_password">Current Password</label>
                <div className="password-input-container">
                  <input
                    id="current_password"
                    name="current_password"
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordData.current_password}
                    onChange={handlePasswordChange}
                    required
                  />
                  <button 
                    type="button" 
                    className="toggle-password-btn"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="new_password">New Password</label>
                <div className="password-input-container">
                  <input
                    id="new_password"
                    name="new_password"
                    type={showNewPassword ? "text" : "password"}
                    value={passwordData.new_password}
                    onChange={handlePasswordChange}
                    required
                    minLength={8}
                  />
                  <button 
                    type="button" 
                    className="toggle-password-btn"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="confirm_password">Confirm New Password</label>
                <div className="password-input-container">
                  <input
                    id="confirm_password"
                    name="confirm_password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordData.confirm_password}
                    onChange={handlePasswordChange}
                    required
                    minLength={8}
                  />
                  <button 
                    type="button" 
                    className="toggle-password-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
              
              <div className="form-actions">
                <button type="submit" className="btn save-btn" disabled={loading}>
                  {loading ? 'Changing...' : 'Change Password'}
                </button>
                <button 
                  type="button" 
                  className="btn cancel-btn" 
                  onClick={() => {
                    setShowPasswordChange(false);
                    setError(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Delete Your Account?</h2>
            <p>This action is permanent and cannot be undone. All your data will be deleted.</p>
            
            <div className="form-actions">
              <button 
                className="btn delete-confirm-btn" 
                onClick={handleDeleteAccount}
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Yes, Delete My Account'}
              </button>
              <button 
                className="btn cancel-btn" 
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;