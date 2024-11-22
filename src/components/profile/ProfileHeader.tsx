import React from 'react';
import { useUserStore } from '../../store/userStore';
import { Settings, Book, Award } from 'lucide-react';

export const ProfileHeader: React.FC = () => {
  const { currentUser } = useUserStore();

  if (!currentUser) return null;

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-5">
          <div className="flex-shrink-0">
            <img
              className="h-20 w-20 rounded-full"
              src={currentUser.avatar}
              alt={currentUser.name}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 truncate">
                  {currentUser.name}
                </h1>
                <p className="text-sm text-gray-500">{currentUser.email}</p>
              </div>
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <Settings className="h-5 w-5 mr-2" />
                Edit Profile
              </button>
            </div>
            <div className="mt-4 flex items-center space-x-6">
              <div className="flex items-center">
                <Book className="h-5 w-5 text-gray-400" />
                <span className="ml-2 text-sm text-gray-500">
                  {currentUser.enrolledCourses.length} Courses Enrolled
                </span>
              </div>
              <div className="flex items-center">
                <Award className="h-5 w-5 text-gray-400" />
                <span className="ml-2 text-sm text-gray-500">
                  {currentUser.createdCourses?.length || 0} Courses Created
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <p className="text-sm text-gray-500">{currentUser.bio}</p>
        </div>
      </div>
    </div>
  );
};