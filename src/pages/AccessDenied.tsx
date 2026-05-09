import React from 'react';
import { Button } from '../components/ui/Button';
import { PageContainer } from '../components/layout/PageContainer';

interface AccessDeniedProps {
  onNavigate: (page: string) => void;
  children?: React.ReactNode;
  sidebarCollapsed: boolean;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({ onNavigate, children, sidebarCollapsed }) => {
  return (
    <PageContainer title="Access Denied" sidebarCollapsed={sidebarCollapsed}>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-pink-50">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4v2m0 6v2m0 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600 mb-4">
              You do not have permission to access this page. Your user role and assigned modules restrict access to this resource.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-2">Why might you see this?</h3>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>Your role doesn't have access to this module</li>
              <li>Your modules haven't been configured yet</li>
              <li>You tried to access an unauthorized resource</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={() => onNavigate('dashboard')}
              className="w-full"
            >
              Go to Dashboard
            </Button>
            <button
              onClick={() => window.history.back()}
              className="w-full px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              Go Back
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-6">
            If you believe this is a mistake, please contact your system administrator.
          </p>
        </div>
      </div>
    </PageContainer>
  );
};
