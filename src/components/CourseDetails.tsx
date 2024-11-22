import React from 'react';
import { FileDown, Book, Clock, Target, BarChart } from 'lucide-react';
import type { Lesson } from '../lib/pocketbase';

interface LessonDetailsProps {
  lesson: Lesson | null;
}

export const LessonDetails: React.FC<LessonDetailsProps> = ({ lesson }) => {
  if (!lesson) {
    return null;
  }

  const {
    description,
    duration,
    resources = [],
    objectives = [],
  } = lesson;

  return (
    <div className="bg-gray-800 rounded-lg p-6 mt-8">
      <h2 className="text-2xl font-bold text-white mb-6">Lesson Details</h2>

      {/* Lesson Description */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-white mb-3">About This Lesson</h3>
        <p className="text-gray-300 leading-relaxed">{description}</p>
      </div>

      {/* Lesson Info */}
      {duration && (
        <div className="flex items-start gap-3 mb-8">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Clock className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-400">Duration</h4>
            <p className="text-white">{duration}</p>
          </div>
        </div>
      )}

      {/* Learning Objectives */}
      {objectives?.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Learning Objectives</h3>
          </div>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            {objectives.map((objective, index) => (
              <li key={index}>{objective}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Resources */}
      {resources?.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <FileDown className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Lesson Resources</h3>
          </div>
          <div className="space-y-3">
            {resources.map((resource, index) => (
              <a
                key={index}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
              >
                <FileDown className="w-4 h-4" />
                <span>{resource.title}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
