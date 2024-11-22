import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { courseService, isAuthenticated, pb, isAdmin } from '../lib/pocketbase';
import { useQuery } from '@tanstack/react-query';
import { Navigation } from '../components/Navigation';
import { Loader2, Image as ImageIcon } from 'lucide-react';

export default function CoursePage() {
  const navigate = useNavigate();

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
    }
  }, [navigate]);

  // Fetch courses - this will now only return accessible courses for regular users
  const { data: courses, isLoading, error } = useQuery({
    queryKey: ['courses'],
    queryFn: () => courseService.getAll(),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mx-auto" />
            <p className="mt-2 text-gray-500 dark:text-gray-400">Loading courses...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Error loading courses
            </h2>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Please try again later
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            {isAdmin() ? 'All Courses' : 'My Courses'}
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400 sm:mt-4">
            {isAdmin() 
              ? 'Manage and view all available courses'
              : 'Access your enrolled courses and continue learning'}
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {courses?.map((course) => (
            <div
              key={course.id}
              className="relative flex flex-col rounded-lg shadow-lg overflow-hidden 
                       bg-white dark:bg-gray-800 transition-all duration-200
                       hover:shadow-xl"
            >
              <div className="relative h-48 bg-gray-900">
                {course.thumbnail ? (
                  <img
                    className="h-full w-full object-cover"
                    src={course.thumbnail}
                    alt={course.title}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.style.display = 'none';
                      target.parentElement?.classList.add('flex', 'items-center', 'justify-center');
                      const icon = document.createElement('div');
                      icon.innerHTML = '<svg class="w-12 h-12 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>';
                      target.parentElement?.appendChild(icon);
                    }}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-gray-600" />
                  </div>
                )}
              </div>

              <div className="flex-1 p-6 flex flex-col justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                      {course.level}
                    </p>
                    {!course.enabled && isAdmin() && (
                      <span className="px-2 py-1 text-xs font-medium text-yellow-600 bg-yellow-100 rounded-full">
                        Disabled
                      </span>
                    )}
                  </div>
                  <div className="block mt-2">
                    <p className="text-xl font-semibold text-gray-900 dark:text-white">
                      {course.title}
                    </p>
                    <p className="mt-3 text-base text-gray-500 dark:text-gray-400">
                      {course.description}
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Duration: {course.duration}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Instructor: {course.expand?.instructor?.username || 'Unknown'}
                    </span>
                  </div>
                  <Link
                    to={`/course/${course.id}`}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 
                             transition-colors duration-200 text-sm font-medium"
                  >
                    View Course
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {(!courses || courses.length === 0) && (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                {isAdmin() 
                  ? 'No courses have been created yet.'
                  : 'You don\'t have access to any courses yet. Please contact an administrator for access.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
