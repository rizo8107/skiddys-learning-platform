import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { courseService, isAuthenticated } from '../lib/pocketbase';
import { useQuery } from '@tanstack/react-query';
import { Navigation } from '../components/Navigation';

export default function CoursePage() {
  const navigate = useNavigate();

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
    }
  }, [navigate]);

  // Fetch courses
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading courses...</p>
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
            <div className="text-red-600 dark:text-red-400 text-xl font-semibold mb-2">
              {error instanceof Error && error.message === "Failed to fetch" 
                ? "Unable to connect to the server. Please make sure the server is running."
                : error instanceof Error && error.message.includes("403")
                ? "You need to be logged in to view courses. Please log in and try again."
                : "Error loading courses. Please try again later."}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
            >
              Try Again
            </button>
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
            Available Courses
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400 sm:mt-4">
            Browse our selection of courses and start learning today
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {courses?.map((course) => (
            <Link
              to={`/course/${course.id}`}
              key={course.id}
              className="flex flex-col rounded-lg shadow-lg overflow-hidden bg-white dark:bg-gray-800 hover:shadow-xl transition-shadow"
            >
              {course.thumbnail && (
                <div className="flex-shrink-0">
                  <img
                    className="h-48 w-full object-cover"
                    src={`http://127.0.0.1:8090/api/files/courses/${course.id}/${course.thumbnail}`}
                    alt={course.title}
                  />
                </div>
              )}
              <div className="flex-1 p-6 flex flex-col justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                    {course.level}
                  </p>
                  <div className="block mt-2">
                    <p className="text-xl font-semibold text-gray-900 dark:text-white">
                      {course.title}
                    </p>
                    <p className="mt-3 text-base text-gray-500 dark:text-gray-400">
                      {course.description}
                    </p>
                  </div>
                </div>
                <div className="mt-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Duration: {course.duration}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
