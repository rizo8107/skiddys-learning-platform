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

export const router = createBrowserRouter([
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
        element: pb.authStore.isValid ? <Navigate to="/courses" replace /> : <Navigate to="/login" replace />,
      },
      {
        path: 'courses',
        element: (
          <ProtectedRoute>
            <CoursePage />
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
      {
        path: 'course/:id',
        element: (
          <ProtectedRoute>
            <CourseDetailsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'support',
        element: (
          <ProtectedRoute>
            <SupportPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'privacy-policy',
        element: <PrivacyPolicyPage />,
      },
    ],
  },
]);
