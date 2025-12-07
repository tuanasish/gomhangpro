import React from 'react';

const PageLoader: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
      <div className="flex flex-col items-center gap-4">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Đang tải...</p>
      </div>
    </div>
  );
};

export default PageLoader;

