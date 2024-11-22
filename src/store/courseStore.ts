import { create } from 'zustand';
import type { Course } from '../types/course';

interface CourseStore {
  currentCourse: Course | null;
  setCurrentCourse: (course: Course) => void;
  toggleLessonComplete: (lessonId: string) => void;
}

export const useCourseStore = create<CourseStore>((set) => ({
  currentCourse: null,
  setCurrentCourse: (course) => set({ currentCourse: course }),
  toggleLessonComplete: (lessonId) =>
    set((state) => {
      if (!state.currentCourse) return state;
      
      const updatedLessons = state.currentCourse.lessons.map((lesson) =>
        lesson.id === lessonId
          ? { ...lesson, completed: !lesson.completed }
          : lesson
      );
      
      const progress = Math.round(
        (updatedLessons.filter((l) => l.completed).length / updatedLessons.length) * 100
      );

      return {
        currentCourse: {
          ...state.currentCourse,
          lessons: updatedLessons,
          progress,
        },
      };
    }),
}));