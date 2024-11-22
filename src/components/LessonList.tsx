import React from 'react';
import { Lesson } from '../lib/pocketbase';
import { CheckCircle, Circle } from 'lucide-react';

interface LessonListProps {
  lessons: Lesson[];
  currentLesson: Lesson | null;
  onSelectLesson: (lesson: Lesson) => void;
}

export function LessonList({ lessons = [], currentLesson, onSelectLesson }: LessonListProps) {
  if (!Array.isArray(lessons) || lessons.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Course Lessons</h2>
        <p className="text-gray-400">No lessons available yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-white mb-4">Course Lessons</h2>
      <div className="space-y-2">
        {lessons.map((lesson) => (
          <button
            key={lesson.id}
            onClick={() => onSelectLesson(lesson)}
            className={`w-full text-left p-3 rounded-lg transition-colors ${
              currentLesson?.id === lesson.id
                ? 'bg-indigo-600 text-white'
                : 'hover:bg-gray-700 text-gray-300'
            }`}
          >
            <div className="flex items-center">
              {currentLesson?.id === lesson.id ? (
                <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              ) : (
                <Circle className="w-5 h-5 mr-2 flex-shrink-0" />
              )}
              <div>
                <h3 className="font-medium">{lesson.lessons_title}</h3>
                {lesson.duration && (
                  <p className="text-sm text-gray-400">{lesson.duration}</p>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}