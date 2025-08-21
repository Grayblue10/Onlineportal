import { useState } from 'react';
import PropTypes from 'prop-types';
import { updateUserProfile, uploadProfilePicture } from '../../services/userService';
import { toast } from 'react-hot-toast';
import Form from '../forms/Form';
import FormInput from '../forms/FormInput';
import { User, Mail, Camera } from 'lucide-react';

const ProfileForm = ({ user, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(user?.profilePicture || '');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (data) => {
    setIsLoading(true);
    
    try {
      // Upload profile image if selected
      if (profileImage) {
        await uploadProfilePicture(user.id, profileImage);
      }
      
      // Update profile data
      const updatedUser = await updateUserProfile(user.id, data);
      
      // Update auth context
      onSuccess(updatedUser);
      
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
      throw error; // Let the form handle the error state
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center">
        <div className="relative group">
          <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            {previewImage ? (
              <img 
                src={previewImage} 
                alt={user?.name || 'Profile'} 
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-16 h-16 text-gray-400" />
            )}
          </div>
          <label 
            className="absolute bottom-0 right-0 bg-primary-500 text-white p-2 rounded-full cursor-pointer hover:bg-primary-600 transition-colors"
            htmlFor="profile-image"
          >
            <Camera className="w-5 h-5" />
            <input
              id="profile-image"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </label>
        </div>
      </div>

      <Form
        schema="profile"
        onSubmit={handleSubmit}
        submitText="Update Profile"
        loading={isLoading}
        defaultValues={{
          fullName: user?.fullName || '',
          email: user?.email || ''
        }}
        className="space-y-4"
      >
        <FormInput
          name="fullName"
          label="Full Name"
          type="text"
          placeholder="Enter your full name"
          leftIcon={<User className="h-5 w-5 text-gray-400" />}
          required
        />

        <FormInput
          name="email"
          label="Email Address"
          type="email"
          placeholder="Enter your email"
          leftIcon={<Mail className="h-5 w-5 text-gray-400" />}
          required
          disabled
        />
      </Form>
    </div>
  );
};

ProfileForm.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string,
    fullName: PropTypes.string,
    email: PropTypes.string,
    profilePicture: PropTypes.string
  }).isRequired,
  onSuccess: PropTypes.func.isRequired
};

export default ProfileForm;
