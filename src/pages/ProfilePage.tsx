import { useState } from 'react';
import { pb } from '../lib/pocketbase';
import { Navigation } from '../components/Navigation';

export default function ProfilePage() {
  const user = pb.authStore.model;
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await pb.collection('users').update(user?.id, {
        name: name,
      });
      setSuccess('Profile updated successfully');
      setIsEditing(false);
    } catch (err) {
      setError('Failed to update profile');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="px-4 sm:px-0">
              <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                Profile Information
              </h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Update your profile information.
              </p>
            </div>

            {error && (
              <div className="mt-4 bg-red-50 dark:bg-red-900 p-4 rounded-md">
                <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
              </div>
            )}

            {success && (
              <div className="mt-4 bg-green-50 dark:bg-green-900 p-4 rounded-md">
                <p className="text-sm text-green-700 dark:text-green-200">
                  {success}
                </p>
              </div>
            )}

            <div className="mt-6">
              <dl className="divide-y divide-gray-200 dark:divide-gray-700">
                <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Email address
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                    {user?.email}
                  </dd>
                </div>

                <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Name
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                    {isEditing ? (
                      <form onSubmit={handleSubmit} className="flex gap-4">
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700"
                        />
                        <button
                          type="submit"
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Cancel
                        </button>
                      </form>
                    ) : (
                      <div className="flex justify-between items-center">
                        <span>{user?.name || 'Not set'}</span>
                        <button
                          onClick={() => setIsEditing(true)}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </dd>
                </div>

                <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Role
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                    {user?.role || 'Student'}
                  </dd>
                </div>

                <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Member since
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                    {new Date(user?.created).toLocaleDateString()}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
