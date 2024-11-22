import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';

// Pages
import RootLayout from './layouts/RootLayout';
import LoginPage from './pages/LoginPage';
import CoursesPage from './pages/CoursesPage';
import CourseDetailsPage from './pages/CourseDetailsPage';
import ProfilePage from './pages/ProfilePage';

// Components
import { ProtectedRoute } from './components/ProtectedRoute';
import { pb } from './lib/pocketbase';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: pb.authStore.isValid ? (
          <Navigate to="/courses" replace />
        ) : (
          <Navigate to="/login" replace />
        ),
      },
      {
        path: 'courses',
        element: (
          <ProtectedRoute>
            <CoursesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'course/:courseId',
        element: (
          <ProtectedRoute>
            <CourseDetailsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
    ],
  },
], {
  future: {
    v7_startTransition: true,
    v7_fetcherPersist: true,
    v7_normalizeFormMethod: true,
    v7_partialHydration: true,
    v7_skipActionErrorRevalidation: true,
    v7_relativeSplatPath: true,
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
);
