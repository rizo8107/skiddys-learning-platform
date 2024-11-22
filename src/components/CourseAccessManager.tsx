import { useState } from 'react';
import { pb } from '../lib/pocketbase';
import { Search, Plus, Loader2 } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';

interface CourseAccessProps {
  courseId: string;
}

export function CourseAccessManager({ courseId }: CourseAccessProps) {
  const [email, setEmail] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Fetch existing course access
  const { data: courseAccess, refetch: refetchAccess } = useQuery({
    queryKey: ['courseAccess', courseId],
    queryFn: async () => {
      return await pb.collection('course_access').getFullList({
        filter: `course="${courseId}"`,
        expand: 'user'
      });
    }
  });

  // Search users
  const searchUsers = async (searchEmail: string) => {
    if (!searchEmail) {
      setSearchResults([]);
      return;
    }
    
    try {
      const results = await pb.collection('users').getList(1, 5, {
        filter: `email~"${searchEmail}"`,
      });
      setSearchResults(results.items);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  // Grant access mutation
  const grantAccessMutation = useMutation({
    mutationFn: async (userId: string) => {
      await pb.collection('course_access').create({
        user: userId,
        course: courseId,
        granted_at: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      refetchAccess();
      setEmail('');
      setSearchResults([]);
    },
  });

  // Revoke access mutation
  const revokeAccessMutation = useMutation({
    mutationFn: async (accessId: string) => {
      await pb.collection('course_access').delete(accessId);
    },
    onSuccess: () => {
      refetchAccess();
    },
  });

  return (
    <div className="space-y-6">
      <div className="bg-gray-800/50 backdrop-blur-lg rounded-lg p-6 border border-gray-700/50">
        <h3 className="text-lg font-medium text-white mb-4">Manage Course Access</h3>
        
        {/* Search and add users */}
        <div className="relative">
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <input
                type="email"
                placeholder="Search user by email..."
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  searchUsers(e.target.value);
                }}
                className="w-full bg-gray-900/50 border border-gray-700 rounded-lg py-2 pl-10 pr-4 
                         text-gray-300 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 
                         focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
            </div>
          </div>

          {/* Search results dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 hover:bg-gray-700/50 cursor-pointer"
                  onClick={() => grantAccessMutation.mutate(user.id)}
                >
                  <span className="text-gray-300">{user.email}</span>
                  <button
                    className="flex items-center gap-2 px-3 py-1 text-sm text-white bg-indigo-600 
                             rounded-md hover:bg-indigo-700 transition-colors duration-200"
                  >
                    {grantAccessMutation.isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        Grant Access
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* List of users with access */}
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-400 mb-3">Users with Access</h4>
          <div className="space-y-2">
            {courseAccess?.map((access: any) => (
              <div
                key={access.id}
                className="flex items-center justify-between p-3 bg-gray-900/30 rounded-lg"
              >
                <div>
                  <p className="text-gray-300">{access.expand?.user?.email}</p>
                  <p className="text-sm text-gray-500">
                    Granted: {new Date(access.granted_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => revokeAccessMutation.mutate(access.id)}
                  className="px-3 py-1 text-sm text-red-400 hover:text-red-300 
                           hover:bg-red-400/10 rounded-md transition-colors duration-200"
                  disabled={revokeAccessMutation.isLoading}
                >
                  {revokeAccessMutation.isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Revoke'
                  )}
                </button>
              </div>
            ))}
            {(!courseAccess || courseAccess.length === 0) && (
              <p className="text-gray-500 text-center py-4">No users have been granted access yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
