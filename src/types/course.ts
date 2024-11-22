export interface Lesson {
  id: string;
  title: string;
  duration: string;
  videoUrl: string;
  completed: boolean;
}

export interface Course {
  id: string;
  title: string;
  author: string;
  thumbnail: string;
  description: string;
  lessons: Lesson[];
  enrolled: boolean;
  progress: number;
}