import { createBrowserRouter, Navigate } from 'react-router-dom';
import RootLayout from './layouts/RootLayout';
import LoginPage from './pages/LoginPage';
import CoursePage from './pages/CoursePage';
import ProfilePage from './pages/ProfilePage';
import CourseDetailsPage from './pages/CourseDetailsPage';
import SupportPage from './pages/SupportPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { pb } from './lib/pocketbase';
import { SiteSettingsPage } from './pages/SiteSettingsPage';
import { ErrorBoundary } from './components/ErrorBoundary';

export const router = createBrowserRouter(
  [
    {
      path: '/login',
      element: <LoginPage />,
      errorElement: <ErrorBoundary />,
    },
    {
      path: '/',
      element: <RootLayout />,
      errorElement: <ErrorBoundary />,
      children: [
        {
          index: true,
          element: pb.authStore.isValid ? <Navigate to="/courses" replace /> : <Navigate to="/login" replace />,
        },
        {
          path: 'courses',
          element: (
            <ProtectedRoute>
              <CoursePage />
            </ProtectedRoute>
          ),
          errorElement: <ErrorBoundary />,
        },
        {
          path: 'profile',
          element: (
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          ),
          errorElement: <ErrorBoundary />,
        },
        {
          path: 'course/:id',
          element: (
            <ProtectedRoute>
              <CourseDetailsPage />
            </ProtectedRoute>
          ),
          errorElement: <ErrorBoundary />,
        },
        {
          path: 'support',
          element: (
            <ProtectedRoute>
              <SupportPage />
            </ProtectedRoute>
          ),
          errorElement: <ErrorBoundary />,
        },
        {
          path: 'site-settings',
          element: (
            <ProtectedRoute>
              <SiteSettingsPage />
            </ProtectedRoute>
          ),
          errorElement: <ErrorBoundary />,
        },
        {
          path: 'privacy-policy',
          element: <PrivacyPolicyPage />,
          errorElement: <ErrorBoundary />,
        },
      ],
    },
  ],
  {
    future: {
      v7_startTransition: true,
    },
  }
);
