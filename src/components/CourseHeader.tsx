import React from 'react';
import { Course } from '../lib/pocketbase';
import { BookOpen, Clock, Signal } from 'lucide-react';

interface CourseHeaderProps {
  course: Course;
}

export function CourseHeader({ course }: CourseHeaderProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex flex-col md:flex-row gap-6">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.course_title}
            className="w-full md:w-64 h-48 object-cover rounded-lg bg-gray-700"
          />
        ) : (
          <div className="w-full md:w-64 h-48 bg-gray-700 rounded-lg flex items-center justify-center">
            <span className="text-gray-400">No thumbnail</span>
          </div>
        )}
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white mb-2">
            {course.course_title}
          </h1>
          <p className="text-gray-300 mb-4">{course.description}</p>
          <div className="flex flex-wrap gap-4">
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
            {course.instructor && (
              <div className="flex items-center text-gray-400">
                <BookOpen className="w-4 h-4 mr-2" />
                <span>By {course.expand?.instructor?.username || 'Unknown'}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}