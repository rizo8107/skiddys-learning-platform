import { useState, useRef } from 'react';
import { pb, getCurrentUser, getFileUrl } from '../lib/pocketbase';
import { Camera, HelpCircle, Shield, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import type { User } from '../lib/pocketbase';

export default function ProfilePage() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const getAvatarUrl = (user: User | null) => {
    if (!user?.avatar) return null;
    return getFileUrl(user, user.avatar);
  };
  
  const [avatarUrl, setAvatarUrl] = useState<string | null>(getAvatarUrl(user));

  const handleLogout = () => {
    pb.authStore.clear();
    navigate('/login');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    
    setError('');
    setSuccess('');

    try {
      const record = await pb.collection('users').update(user.id, {
        name: name,
      });
      setSuccess('Profile updated successfully');
      setIsEditing(false);
      
      // Update the auth store to reflect the changes
      pb.authStore.save(pb.authStore.token, record);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    setIsUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const record = await pb.collection('users').update(user.id, formData);
      setAvatarUrl(getAvatarUrl(record));
      
      // Update the auth store to reflect the changes
      pb.authStore.save(pb.authStore.token, record);
    } catch (err) {
      console.error('Error uploading avatar:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload avatar');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-xl">
          {/* Profile Header */}
          <div className="p-8 sm:p-10 border-b border-gray-700">
            <div className="flex items-center space-x-5">
              <div className="relative">
                <div 
                  className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-700 cursor-pointer group"
                  onClick={handleAvatarClick}
                >
                  {avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      alt={user?.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
              <div>
                {isEditing ? (
                  <form onSubmit={handleSubmit} className="flex items-center space-x-3">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="px-3 py-1 bg-gray-800 border border-gray-600 rounded text-white"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center space-x-3">
                    <h2 className="text-2xl font-bold text-white">
                      {user?.name}
                    </h2>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-sm text-gray-400 hover:text-white"
                    >
                      Edit
                    </button>
                  </div>
                )}
                <p className="text-gray-400 mt-1">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="p-8 sm:p-10">
            <h3 className="text-lg font-medium text-white mb-6">Quick Links</h3>
            <div className="space-y-4">
              <Link
                to="/support"
                className="flex items-center space-x-3 text-gray-300 hover:text-white p-3 rounded-lg hover:bg-white/5 transition-colors"
              >
                <HelpCircle className="w-5 h-5" />
                <div>
                  <p className="font-medium">Support & Feedback</p>
                  <p className="text-sm text-gray-400">Get help or send us your feedback</p>
                </div>
              </Link>

              <Link
                to="/privacy-policy"
                className="flex items-center space-x-3 text-gray-300 hover:text-white p-3 rounded-lg hover:bg-white/5 transition-colors"
              >
                <Shield className="w-5 h-5" />
                <div>
                  <p className="font-medium">Privacy Policy</p>
                  <p className="text-sm text-gray-400">Read our privacy policy</p>
                </div>
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 text-red-400 hover:text-red-300 p-3 rounded-lg hover:bg-white/5 transition-colors w-full text-left"
              >
                <LogOut className="w-5 h-5" />
                <div>
                  <p className="font-medium">Sign Out</p>
                  <p className="text-sm text-red-400/70">Sign out of your account</p>
                </div>
              </button>
            </div>
          </div>

          {error && (
            <div className="mx-8 sm:mx-10 mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {success && (
            <div className="mx-8 sm:mx-10 mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-lg">
              <p className="text-sm text-green-400">{success}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
