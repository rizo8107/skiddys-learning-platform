import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { courseService, Course } from '../lib/pocketbase';
import { Loader2, BookOpen, Clock, Signal, AlertCircle } from 'lucide-react';

export default function CoursesPage() {
  const { data: courses = [], isLoading, error, refetch } = useQuery<Course[]>({
    queryKey: ['courses'],
    queryFn: () => courseService.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const renderLoadingState = () => (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
    </div>
  );

  const renderErrorState = () => (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Error Loading Courses</h2>
        <p className="text-gray-400 mb-4">{error instanceof Error ? error.message : 'Please try again later'}</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  const renderEmptyState = () => (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">No Courses Available</h2>
        <p className="text-gray-400">Check back later for new courses</p>
      </div>
    </div>
  );

  const renderCourseCard = (course: Course) => (
    <Link
      key={course.id}
      to={`/course/${course.id}`}
      className="bg-gray-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-indigo-500 transition-all group"
    >
      <div className="relative">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.course_title}
            className="w-full h-48 object-cover bg-gray-700 group-hover:opacity-90 transition-opacity"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-48 bg-gray-700 flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-gray-400" />
          </div>
        )}
      </div>
      <div className="p-6">
        <h2 className="text-xl font-semibold text-white mb-2 group-hover:text-indigo-400 transition-colors">
          {course.course_title}
        </h2>
        <p className="text-gray-400 mb-4 line-clamp-2">
          {course.description}
        </p>
        <div className="flex flex-wrap gap-4">
          {course.instructor && (
            <div className="flex items-center text-gray-400">
              <BookOpen className="w-4 h-4 mr-2" />
              <span>{course.expand?.instructor?.username || 'Unknown'}</span>
            </div>
          )}
          {course.duration && (
            <div className="flex items-center text-gray-400">
              <Clock className="w-4 h-4 mr-2" />
              <span>{course.duration}</span>
            </div>
          )}
          {course.level && (
            <div className="flex items-center text-gray-400">
              <Signal className="w-4 h-4 mr-2" />
              <span>{course.level}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );

  if (isLoading) return renderLoadingState();
  if (error) return renderErrorState();
  if (courses.length === 0) return renderEmptyState();

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-white mb-8">Available Courses</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(renderCourseCard)}
        </div>
      </div>
    </div>
  );
}
