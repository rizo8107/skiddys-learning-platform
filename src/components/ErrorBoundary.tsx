import { useRouteError } from 'react-router-dom';

export function ErrorBoundary() {
  const error = useRouteError() as Error;

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl max-w-lg w-full">
        <h1 className="text-2xl font-bold text-white mb-4">Oops! Something went wrong</h1>
        <p className="text-gray-300 mb-4">
          {error.message || 'An unexpected error occurred.'}
        </p>
        <button
          onClick={() => window.location.href = '/'}
          className="text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          Return to home
        </button>
      </div>
    </div>
  );
}
