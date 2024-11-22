import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LoginPage from './pages/LoginPage';
import CoursePage from './pages/CoursePage';
import ProfilePage from './pages/ProfilePage';
import CourseDetailsPage from './pages/CourseDetailsPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { isAuthenticated } from './lib/pocketbase';

// Mock data for demonstration
const mockCourse = {
  id: '1',
  title: 'Full Stack Development Masterclass',
  author: 'Sarah Johnson',
  thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
  description: 'Master modern web development with this comprehensive course covering frontend, backend, and deployment strategies. Learn to build scalable applications using React, Node.js, and modern cloud infrastructure.',
  duration: '12 weeks (40+ hours)',
  level: 'Intermediate',
  enrolled: true,
  progress: 45,
  prerequisites: [
    'Basic understanding of HTML, CSS, and JavaScript',
    'Familiarity with programming concepts',
    'Basic command line knowledge'
  ],
  skills: [
    'React',
    'Node.js',
    'TypeScript',
    'REST APIs',
    'Database Design',
    'Cloud Deployment',
    'Git',
    'Testing'
  ],
  resources: [
    {
      id: '1',
      title: 'Course Slides',
      type: 'document',
      size: '15.2 MB'
    },
    {
      id: '2',
      title: 'Starter Project Files',
      type: 'document',
      size: '4.8 MB'
    },
    {
      id: '3',
      title: 'Additional Learning Materials',
      type: 'video'
    },
    {
      id: '4',
      title: 'Practice Exercises',
      type: 'exercise'
    }
  ],
  lessons: [
    {
      id: '1',
      title: 'Course Introduction & Setup',
      duration: '15:30',
      videoUrl: 'https://app.tpstreams.com/embed/6u448b/8NZz4NSxM7s/?access_token=49e7500d-ef08-405e-a6bc-490b3212a0c0',
      completed: true
    },
    {
      id: '2',
      title: 'Frontend Fundamentals',
      duration: '23:45',
      videoUrl: 'https://app.tpstreams.com/embed/6u448b/8NZz4NSxM7s/?access_token=49e7500d-ef08-405e-a6bc-490b3212a0c0',
      completed: true
    },
    {
      id: '3',
      title: 'React Components & Props',
      duration: '28:15',
      videoUrl: 'https://app.tpstreams.com/embed/6u448b/8NZz4NSxM7s/?access_token=49e7500d-ef08-405e-a6bc-490b3212a0c0',
      completed: true
    }
  ]
};

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}

export default App;