import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { courseService, Course } from '../lib/pocketbase';
import { Loader2, BookOpen, Clock, Signal } from 'lucide-react';

export default function CoursesPage() {
  const { data: courses = [], isLoading, error } = useQuery<Course[]>({
    queryKey: ['courses'],
    queryFn: () => courseService.getAll(),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Error Loading Courses</h2>
          <p className="text-gray-400">Please try again later</p>
        </div>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">No Courses Available</h2>
          <p className="text-gray-400">Check back later for new courses</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-white mb-8">Available Courses</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Link
              key={course.id}
              to={`/course/${course.id}`}
              className="bg-gray-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-indigo-500 transition-all"
            >
              {course.thumbnail ? (
                <img
                  src={course.thumbnail}
                  alt={course.course_title}
                  className="w-full h-48 object-cover bg-gray-700"
                />
              ) : (
                <div className="w-full h-48 bg-gray-700 flex items-center justify-center">
                  <span className="text-gray-400">No thumbnail</span>
                </div>
              )}
              <div className="p-6">
                <h2 className="text-xl font-semibold text-white mb-2">
                  {course.course_title}
                </h2>
                <p className="text-gray-400 mb-4 line-clamp-2">
                  {course.description}
                </p>
                <div className="flex flex-wrap gap-4">
                  {course.instructor && (
                    <div className="flex items-center text-gray-400">
                      <BookOpen className="w-4 h-4 mr-2" />
                      <span>By {course.expand?.instructor?.username || 'Unknown'}</span>
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
          ))}
        </div>
      </div>
    </div>
  );
}
