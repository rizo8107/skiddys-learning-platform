import React from 'react';
import { FileDown, Book, Clock, Target, BarChart } from 'lucide-react';
import type { Course } from '../lib/pocketbase';

interface CourseDetailsProps {
  course: Course;
}

export const CourseDetails: React.FC<CourseDetailsProps> = ({ course }) => {
  const {
    description,
    duration,
    level,
    prerequisites = [],
    skills = [],
  } = course;

  return (
    <div className="bg-gray-800 rounded-lg p-6 mt-8">
      <h2 className="text-2xl font-bold text-white mb-6">Course Details</h2>

      {/* Course Description */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-white mb-3">About This Course</h3>
        <p className="text-gray-300 leading-relaxed">{description}</p>
      </div>

      {/* Course Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Clock className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-400">Duration</h4>
            <p className="text-white">{duration}</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Target className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-400">Level</h4>
            <p className="text-white">{level}</p>
          </div>
        </div>
      </div>

      {/* Prerequisites */}
      {prerequisites.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Book className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Prerequisites</h3>
          </div>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            {prerequisites.map((prerequisite, index) => (
              <li key={index}>{prerequisite}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <BarChart className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">What You'll Learn</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
