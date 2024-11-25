import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { VideoPlayer } from '../components/VideoPlayer';
import { LessonList } from '../components/LessonList';
import { CourseHeader } from '../components/CourseHeader';
import { LessonDetails } from '../components/LessonDetails';
import { ReviewList } from '../components/ReviewList';
import { courseService, lessonService, Course, Lesson } from '../lib/pocketbase';
import { Loader2 } from 'lucide-react';

export default function CourseDetailsPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);

  const { data: course, isLoading: isCourseLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => courseId ? courseService.getOne(courseId) : null,
    enabled: !!courseId,
  });

  const { data: lessons = [], isLoading: isLessonsLoading } = useQuery({
    queryKey: ['lessons', courseId],
    queryFn: () => courseId ? lessonService.getAll(courseId) : [],
    enabled: !!courseId,
  });

  useEffect(() => {
    if (lessons.length > 0 && !currentLesson) {
      setCurrentLesson(lessons[0]);
    }
  }, [lessons, currentLesson]);

  if (!courseId) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Course ID is required</div>
      </div>
    );
  }

  if (isCourseLoading || isLessonsLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Course not found</h2>
          <p className="text-gray-400 mb-4">The course you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/courses')}
            className="text-indigo-400 hover:text-indigo-300"
          >
            Return to courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <CourseHeader course={course} />
        
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {currentLesson ? (
              <>
                <VideoPlayer
                  lessons_title={currentLesson.lessons_title}
                  videoUrl={currentLesson.videoUrl}
                />
                <div className="mt-6 bg-gray-800 rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-white mb-2">
                    {currentLesson.lessons_title}
                  </h2>
                  <p className="text-gray-300">{currentLesson.description}</p>
                </div>
              </>
            ) : (
              <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center">
                <p className="text-gray-400">Select a lesson to start learning</p>
              </div>
            )}
            <LessonDetails lesson={currentLesson} />
          </div>
          
          <div className="lg:col-span-1 space-y-6">
            <LessonList
              lessons={lessons}
              currentLesson={currentLesson}
              onSelectLesson={setCurrentLesson}
            />
            <ReviewList courseId={course.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
