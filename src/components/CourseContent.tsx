import React from 'react';
import { Clock, Book } from 'lucide-react';
import type { Lesson } from '../types/course';

interface CourseContentProps {
  lesson?: Lesson;
}

export const CourseContent: React.FC<CourseContentProps> = ({ lesson }) => {
  if (!lesson) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <p className="text-gray-400">Select a lesson to view its content.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-white mb-4">{lesson.title}</h2>
      
      <div className="flex items-center gap-6 text-gray-300">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          <span>{lesson.duration}</span>
        </div>
        <div className="flex items-center gap-2">
          <Book className="w-5 h-5" />
          <span>Lesson Material</span>
        </div>
      </div>

      <div className="mt-6 text-gray-300">
        <h3 className="text-lg font-medium text-white mb-2">About this lesson</h3>
        <p>
          Learn the core concepts and best practices covered in this lesson. Follow along
          with the video and practice the examples to master the material.
        </p>
      </div>
    </div>
  );
};
