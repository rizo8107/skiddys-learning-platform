import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { pb } from './lib/pocketbase';
import { router } from './routes';

const queryClient = new QueryClient();

// Error Boundary Component
function ErrorFallback() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Oops! Something went wrong</h2>
        <p className="text-gray-400 mb-8">Please try again or contact support if the problem persists.</p>
        <a href="/" className="text-indigo-400 hover:text-indigo-300">
          Return to Home
        </a>
      </div>
    </div>
  );
}

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!pb.authStore.isValid) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;